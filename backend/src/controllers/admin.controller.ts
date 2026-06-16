import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

import { getSettings, saveSettings } from '../utils/settings';

export class AdminController {
  
  // 1. Stats endpoint
  async getStats(req: Request, res: Response) {
    try {
      const totalUsers = await prisma.user.count({ where: { deletedAt: null } });
      const totalFreelancers = await prisma.user.count({ where: { role: 'FREELANCER', deletedAt: null } });
      const totalClients = await prisma.user.count({ where: { role: 'CLIENT', deletedAt: null } });
      
      // Calculate earnings from completed transactions or project budgets
      const completedTransactions = await prisma.transaction.findMany({
        where: { status: 'COMPLETED' }
      });
      const totalEarnings = completedTransactions.reduce((acc, t) => acc + Number(t.amount), 0);
      
      const completedProjects = await prisma.project.count({ where: { status: 'COMPLETED', deletedAt: null } });
      const pendingDisputes = await prisma.dispute.count({ where: { status: 'PENDING' } });
      
      // Recent projects
      const recentProjects = await prisma.project.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        where: { deletedAt: null },
        include: {
          client: { select: { firstName: true, lastName: true } }
        }
      });
      
      // Recent transactions
      const recentTransactions = await prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } }
        }
      });
      
      res.json({
        success: true,
        data: {
          stats: {
            totalUsers,
            totalFreelancers,
            totalClients,
            totalEarnings,
            completedProjects,
            pendingDisputes
          },
          recentProjects,
          recentTransactions
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // 2. Charts endpoint
  async getCharts(req: Request, res: Response) {
    try {
      // 2.1 Earning overview chart data (group by date)
      const transactions = await prisma.transaction.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'asc' }
      });
      
      const earningsByDate: Record<string, number> = {};
      transactions.forEach(t => {
        const dateStr = t.createdAt.toISOString().split('T')[0];
        earningsByDate[dateStr] = (earningsByDate[dateStr] || 0) + Number(t.amount);
      });
      
      const earningsOverview = Object.entries(earningsByDate).map(([date, amount]) => ({
        date,
        amount
      }));
      
      // 2.2 Transaction statuses chart data
      const completedTx = await prisma.transaction.count({ where: { status: 'COMPLETED' } });
      const pendingTx = await prisma.transaction.count({ where: { status: 'PENDING' } });
      const failedTx = await prisma.transaction.count({ where: { status: 'FAILED' } });
      
      const transactionStats = [
        { name: 'Completed', value: completedTx },
        { name: 'In Progress', value: pendingTx },
        { name: 'Cancelled', value: failedTx }
      ];
      
      // 2.3 Top Categories chart data
      const projects = await prisma.project.findMany({
        where: { deletedAt: null }
      });
      
      const categoryCounts: Record<string, number> = {};
      projects.forEach(p => {
        const cat = p.category || 'Other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
      
      const totalProjectsCount = projects.length || 1;
      const topCategories = Object.entries(categoryCounts).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalProjectsCount) * 100)
      })).sort((a, b) => b.count - a.count);

      res.json({
        success: true,
        data: {
          earningsOverview,
          transactionStats,
          topCategories
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // 3. User lists and actions
  async getUsers(req: Request, res: Response) {
    try {
      const { role, status, search, profileType, page = '1', limit = '50' } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const whereClause: any = {
        deletedAt: null,
        role: role ? (role as any) : undefined,
        status: status ? (status as string) : undefined,
        OR: search ? [
          { email: { contains: search as string } },
          { firstName: { contains: search as string } },
          { lastName: { contains: search as string } }
        ] : undefined
      };

      if (profileType === 'BUSINESS') {
        whereClause.businessProfile = { isNot: null };
      } else if (profileType === 'CLIENT') {
        whereClause.clientProfile = { isNot: null };
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          include: {
            freelancerProfile: {
              include: { skills: true, portfolios: true, certificates: true }
            },
            clientProfile: true,
            businessProfile: true
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        prisma.user.count({ where: whereClause })
      ]);
      
      res.json({ 
        success: true, 
        data: users,
        pagination: {
          total,
          page: Number(page),
          limit: take,
          totalPages: Math.ceil(total / take)
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // Create Freelancer (User + Profile + Nested data)
  async createFreelancer(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, isVerified, profile } = req.body;
      const { title, bio, hourlyRate, availability, portfolioUrl, skills, portfolios, certificates } = profile || {};

      if (!email || !password) {
        return res.status(400).json({ success: false, error: { message: 'Email and password are required' } });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existingUser) {
        return res.status(400).json({ success: false, error: { message: 'Email is already in use' } });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          role: 'FREELANCER',
          firstName,
          lastName,
          isVerified: isVerified || false,
          freelancerProfile: {
            create: {
              title,
              bio,
              hourlyRate: hourlyRate ? Number(hourlyRate) : null,
              availability,
              portfolioUrl,
              skills: skills && skills.length > 0 ? {
                connectOrCreate: skills.map((s: string) => ({
                  where: { name: s },
                  create: { name: s }
                }))
              } : undefined,
              portfolios: portfolios && portfolios.length > 0 ? {
                create: portfolios.map((p: any) => ({
                  title: p.title,
                  description: p.description,
                  link: p.link,
                  imageUrl: p.imageUrl
                }))
              } : undefined,
              certificates: certificates && certificates.length > 0 ? {
                create: certificates.map((c: any) => ({
                  name: c.name,
                  issuingOrg: c.issuingOrg,
                  issueDate: c.issueDate ? new Date(c.issueDate) : null,
                  imageUrl: c.imageUrl || null
                }))
              } : undefined
            }
          }
        },
        include: {
          freelancerProfile: {
            include: { skills: true, portfolios: true, certificates: true }
          }
        }
      });

      res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // Update Freelancer
  async updateFreelancer(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { firstName, lastName, isVerified, status, profile } = req.body;
      const { title, bio, hourlyRate, availability, portfolioUrl, skills, portfolios, certificates } = profile || {};

      // 1. Update User basic info
      const userUpdate: any = {};
      if (firstName !== undefined) userUpdate.firstName = firstName;
      if (lastName !== undefined) userUpdate.lastName = lastName;
      if (isVerified !== undefined) userUpdate.isVerified = isVerified;
      if (status !== undefined) userUpdate.status = status;

      await prisma.user.update({
        where: { id },
        data: userUpdate
      });

      // 2. Update Freelancer Profile if provided
      if (profile) {
        const fpUpdate: any = {};
        if (title !== undefined) fpUpdate.title = title;
        if (bio !== undefined) fpUpdate.bio = bio;
        if (hourlyRate !== undefined) fpUpdate.hourlyRate = Number(hourlyRate);
        if (availability !== undefined) fpUpdate.availability = availability;
        if (portfolioUrl !== undefined) fpUpdate.portfolioUrl = portfolioUrl;

        // Reconnect skills (replace completely)
        if (skills) {
          fpUpdate.skills = {
            set: [], // Disconnect all
            connectOrCreate: skills.map((s: string) => ({
              where: { name: s },
              create: { name: s }
            }))
          };
        }

        const freelancerProfile = await prisma.freelancerProfile.findUnique({ where: { userId: id } });
        
        if (freelancerProfile) {
          await prisma.freelancerProfile.update({
            where: { userId: id },
            data: fpUpdate
          });

          // Handle Portfolios: simplest way is delete all and recreate (for admin edit)
          if (portfolios) {
            await prisma.portfolio.deleteMany({ where: { freelancerId: freelancerProfile.id } });
            if (portfolios.length > 0) {
              await prisma.portfolio.createMany({
                data: portfolios.map((p: any) => ({
                  freelancerId: freelancerProfile.id,
                  title: p.title,
                  description: p.description,
                  link: p.link,
                  imageUrl: p.imageUrl
                }))
              });
            }
          }

          // Handle Certificates
          if (certificates) {
            await prisma.certificate.deleteMany({ where: { freelancerId: freelancerProfile.id } });
            if (certificates.length > 0) {
              await prisma.certificate.createMany({
                data: certificates.map((c: any) => ({
                  freelancerId: freelancerProfile.id,
                  name: c.name,
                  issuingOrg: c.issuingOrg,
                  issueDate: c.issueDate ? new Date(c.issueDate) : null,
                  imageUrl: c.imageUrl || null
                }))
              });
            }
          }
        } else {
          // Creating profile if it didn't exist
          await prisma.freelancerProfile.create({
            data: {
              userId: id,
              ...fpUpdate
            }
          });
        }
      }

      // Fetch the updated user
      const updatedUser = await prisma.user.findUnique({
        where: { id },
        include: {
          freelancerProfile: {
            include: { skills: true, portfolios: true, certificates: true }
          }
        }
      });

      res.json({ success: true, data: updatedUser });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // Create Client
  async createClient(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, isVerified, avatarUrl, profile } = req.body;
      const { companyName, website, bio } = profile || {};

      if (!email || !password) {
        return res.status(400).json({ success: false, error: { message: 'Email and password are required' } });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existingUser) {
        return res.status(400).json({ success: false, error: { message: 'Email is already in use' } });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          role: 'CLIENT',
          firstName,
          lastName,
          avatarUrl,
          isVerified: isVerified || false,
          clientProfile: {
            create: {
              companyName: companyName || '',
              website,
              bio
            }
          }
        },
        include: { clientProfile: true }
      });

      res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // Update Client
  async updateClient(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { firstName, lastName, isVerified, avatarUrl, status, profile } = req.body;
      const { companyName, website, bio } = profile || {};

      const userUpdate: any = {};
      if (firstName !== undefined) userUpdate.firstName = firstName;
      if (lastName !== undefined) userUpdate.lastName = lastName;
      if (avatarUrl !== undefined) userUpdate.avatarUrl = avatarUrl;
      if (isVerified !== undefined) userUpdate.isVerified = isVerified;
      if (status !== undefined) userUpdate.status = status;

      await prisma.user.update({
        where: { id },
        data: userUpdate
      });

      if (profile) {
        const cpUpdate: any = {};
        if (companyName !== undefined) cpUpdate.companyName = companyName;
        if (website !== undefined) cpUpdate.website = website;
        if (bio !== undefined) cpUpdate.bio = bio;

        const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: id } });
        if (clientProfile) {
          await prisma.clientProfile.update({
            where: { userId: id },
            data: cpUpdate
          });
        } else {
          await prisma.clientProfile.create({
            data: { userId: id, ...cpUpdate }
          });
        }
      }

      const updatedUser = await prisma.user.findUnique({
        where: { id },
        include: { clientProfile: true }
      });

      res.json({ success: true, data: updatedUser });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // Create Business
  async createBusiness(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, isVerified, avatarUrl, profile } = req.body;
      const { companyName, industry, website, size } = profile || {};

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ success: false, error: { message: 'Email already exists' } });
      }

      const normalizedEmail = email.toLowerCase();
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          role: 'CLIENT',
          firstName,
          lastName,
          avatarUrl,
          isVerified: isVerified || false,
          businessProfile: {
            create: {
              companyName: companyName || '',
              industry,
              website,
              size
            }
          }
        },
        include: { businessProfile: true }
      });

      res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // Update Business
  async updateBusiness(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { firstName, lastName, isVerified, avatarUrl, status, profile } = req.body;
      const { companyName, industry, website, size } = profile || {};

      const userUpdate: any = {};
      if (firstName !== undefined) userUpdate.firstName = firstName;
      if (lastName !== undefined) userUpdate.lastName = lastName;
      if (avatarUrl !== undefined) userUpdate.avatarUrl = avatarUrl;
      if (isVerified !== undefined) userUpdate.isVerified = isVerified;
      if (status !== undefined) userUpdate.status = status;

      await prisma.user.update({
        where: { id },
        data: userUpdate
      });

      if (profile) {
        const bpUpdate: any = {};
        if (companyName !== undefined) bpUpdate.companyName = companyName;
        if (industry !== undefined) bpUpdate.industry = industry;
        if (website !== undefined) bpUpdate.website = website;
        if (size !== undefined) bpUpdate.size = size;

        const businessProfile = await prisma.businessProfile.findUnique({ where: { userId: id } });
        if (businessProfile) {
          await prisma.businessProfile.update({
            where: { userId: id },
            data: bpUpdate
          });
        } else {
          await prisma.businessProfile.create({
            data: { userId: id, ...bpUpdate }
          });
        }
      }

      const updatedUser = await prisma.user.findUnique({
        where: { id },
        include: { businessProfile: true }
      });

      res.json({ success: true, data: updatedUser });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // Delete User (Soft Delete)
  async deleteUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      
      const user = await prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: 'DELETED'
        }
      });
      
      res.json({ success: true, data: user, message: 'User deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async updateUserStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { status } = req.body; // e.g. ACTIVE, SUSPENDED
      
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { status: status as string }
      });
      
      res.json({ success: true, data: updatedUser, message: 'User status updated successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async verifyUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { isVerified } = req.body;
      
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { isVerified: Boolean(isVerified) }
      });
      
      res.json({ success: true, data: updatedUser, message: 'User verification status updated' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // 4. Project actions
  async getProjects(req: Request, res: Response) {
    try {
      const { status, category, search } = req.query;
      
      const projects = await prisma.project.findMany({
        where: {
          deletedAt: null,
          status: status ? (status as any) : undefined,
          category: category ? (category as string) : undefined,
          OR: search ? [
            { title: { contains: search as string } },
            { description: { contains: search as string } }
          ] : undefined
        },
        include: {
          client: { select: { firstName: true, lastName: true, email: true } },
          proposals: {
            include: {
              freelancer: {
                include: { user: { select: { firstName: true, lastName: true } } }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json({ success: true, data: projects });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async getProjectById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { ProjectRepository } = require('../repositories/project.repository');
      const projectRepo = new ProjectRepository();
      
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          client: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
          proposals: {
            include: {
              freelancer: {
                include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } } }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          escrow: true,
          progressSteps: { orderBy: { orderIndex: 'asc' } },
          disputes: {
            include: { initiator: { select: { id: true, firstName: true, lastName: true, email: true } } },
            orderBy: { createdAt: 'desc' }
          },
          reviews: {
            include: {
              reviewer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
              reviewee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
            }
          }
        }
      });
      
      if (!project) {
        return res.status(404).json({ success: false, error: { message: 'Project not found' } });
      }
      
      const parsedProject = projectRepo.parseProjectMetadata(project);
      
      // Merge disputes and progressSteps into the parsed project response
      parsedProject.disputes = project.disputes;
      parsedProject.progressSteps = project.progressSteps;
      
      res.json({ success: true, data: parsedProject });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async updateProjectStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      
      const updatedProject = await prisma.project.update({
        where: { id },
        data: { status: status as any }
      });
      
      res.json({ success: true, data: updatedProject, message: 'Project status updated successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // 5. Payment ledger & escrow
  async getTransactions(req: Request, res: Response) {
    try {
      const transactions = await prisma.transaction.findMany({
        include: {
          user: { select: { firstName: true, lastName: true, email: true, role: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      const escrows = await prisma.escrowPayment.findMany({
        include: {
          project: {
            include: {
              client: { select: { firstName: true, lastName: true } },
              proposals: {
                where: { status: 'ACCEPTED' },
                include: { freelancer: { include: { user: true } } }
              }
            }
          }
        }
      });
      
      res.json({
        success: true,
        data: {
          transactions,
          escrows
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // Manual Escrow Release
  async releaseEscrow(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      
      const escrow = await prisma.escrowPayment.findUnique({
        where: { id },
        include: {
          project: {
            include: {
              proposals: {
                where: { status: 'ACCEPTED' },
                include: { freelancer: true }
              }
            }
          }
        }
      });
      
      if (!escrow) {
        return res.status(404).json({ success: false, error: { message: 'Escrow payment not found' } });
      }
      
      if (escrow.status !== 'HELD') {
        return res.status(400).json({ success: false, error: { message: 'Escrow is not currently held' } });
      }

      const acceptedProposal = escrow.project?.proposals?.[0];
      if (!acceptedProposal) {
        return res.status(400).json({ success: false, error: { message: 'Cannot release escrow: No accepted freelancer found for project' } });
      }

      const freelancerUserId = acceptedProposal.freelancer.userId;

      // Get settings for commission
      const { getSettings } = require('../utils/settings');
      const settings = getSettings();
      const commissionRate = settings.commissionRate || 15;
      const escrowAmountNum = Number(escrow.amount);
      const platformFee = Number((escrowAmountNum * (commissionRate / 100)).toFixed(2));
      const freelancerAmount = Number((escrowAmountNum - platformFee).toFixed(2));

      // Update escrow status and create transactions for the freelancer and platform fee
      const [updatedEscrow, transaction] = await prisma.$transaction([
        prisma.escrowPayment.update({
          where: { id },
          data: { status: 'RELEASED' }
        }),
        prisma.transaction.create({
          data: {
            userId: freelancerUserId,
            amount: freelancerAmount,
            type: 'PAYMENT',
            status: 'COMPLETED',
            reference: `MANUAL_RELEASE_${id}`
          }
        }),
        prisma.transaction.create({
          data: {
            userId: escrow.project.clientId, // Using client ID as reference, ideally there's a platform account
            amount: platformFee,
            type: 'PAYMENT',
            status: 'COMPLETED',
            reference: `PLATFORM_FEE_RELEASE_${id}`
          }
        })
      ]);

      res.json({ success: true, data: updatedEscrow, message: 'Escrow released manually successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // 6. Disputes management
  async getDisputes(req: Request, res: Response) {
    try {
      const disputes = await prisma.dispute.findMany({
        include: {
          project: {
            include: {
              client: { select: { id: true, firstName: true, lastName: true, email: true } },
              proposals: {
                where: { status: 'ACCEPTED' },
                include: {
                  freelancer: {
                    include: {
                      user: { select: { id: true, firstName: true, lastName: true, email: true } }
                    }
                  }
                }
              }
            }
          },
          initiator: { select: { id: true, firstName: true, lastName: true, email: true, role: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json({ success: true, data: disputes });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async updateDispute(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { status, resolution } = req.body;
      
      const updatedDispute = await prisma.dispute.update({
        where: { id },
        data: {
          status: status as any,
          resolution: resolution as string | null,
          ...(status === 'RESOLVED' ? { project: { update: { status: 'COMPLETED' } } } : {})
        }
      });
      
      res.json({ success: true, data: updatedDispute, message: 'Dispute status updated successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // 7. Settings general
  async getSettings(req: Request, res: Response) {
    try {
      const settings = getSettings();
      res.json({ success: true, data: settings });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  async updateSettings(req: Request, res: Response) {
    try {
      const settings = getSettings();
      const updatedSettings = {
        ...settings,
        ...req.body
      };
      saveSettings(updatedSettings);
      res.json({ success: true, data: updatedSettings, message: 'Settings saved successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // 8. Skills
  async getSkills(req: Request, res: Response) {
    try {
      const skills = await prisma.skill.findMany({
        orderBy: { name: 'asc' }
      });
      res.json({ success: true, data: skills });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  // 9. Full Analytics (Rich graphs)
  async getFullAnalytics(req: Request, res: Response) {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const yesterday = new Date(startOfDay);
      yesterday.setDate(startOfDay.getDate() - 1);

      const totalRevenue = await prisma.transaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      });
      const revenueToday = await prisma.transaction.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: startOfDay } },
        _sum: { amount: true }
      });
      const revenueYesterday = await prisma.transaction.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: yesterday, lt: startOfDay } },
        _sum: { amount: true }
      });

      const projects = await prisma.project.findMany({ where: { deletedAt: null } });
      const catCounts: Record<string, number> = {};
      projects.forEach(p => catCounts[p.category || 'Other'] = (catCounts[p.category || 'Other'] || 0) + 1);
      const topCategories = Object.entries(catCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);

      const txs = await prisma.transaction.findMany({ where: { status: 'COMPLETED', type: 'PAYMENT' }, include: { user: true }});
      const clientSpending: Record<string, {name: string, spent: number}> = {};
      txs.forEach(t => {
        if (!clientSpending[t.userId]) clientSpending[t.userId] = { name: t.user.firstName + ' ' + t.user.lastName, spent: 0 };
        clientSpending[t.userId].spent += Number(t.amount);
      });
      const topClients = Object.values(clientSpending).sort((a, b) => b.spent - a.spent).slice(0, 5);

      res.json({
        success: true,
        data: {
          revenue: {
            total: totalRevenue._sum.amount || 0,
            today: revenueToday._sum.amount || 0,
            yesterday: revenueYesterday._sum.amount || 0,
          },
          topCategories,
          topClients
        }
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  }

  // 10. Reviews
  async getReviews(req: Request, res: Response) {
    try {
      const reviews = await prisma.review.findMany({
        include: {
          project: true,
          reviewer: { select: { firstName: true, lastName: true } },
          reviewee: { select: { firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, data: reviews });
    } catch (e: any) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  }

  // 11. Categories List
  async getCategories(req: Request, res: Response) {
    try {
      const projects = await prisma.project.findMany({ where: { deletedAt: null } });
      const catCounts: Record<string, { activeJobs: number }> = {};
      projects.forEach(p => {
        const cat = p.category || 'Other';
        if (!catCounts[cat]) catCounts[cat] = { activeJobs: 0 };
        catCounts[cat].activeJobs += 1;
      });

      const categories = Object.entries(catCounts).map(([name, data]) => ({
        name,
        activeJobs: data.activeJobs
      }));

      res.json({ success: true, data: categories });
    } catch (e: any) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  }

  // 11b. Category Detail
  async getCategoryDetail(req: Request, res: Response) {
    try {
      const categoryName = decodeURIComponent(req.params.name as string);

      // Get all projects in this category
      const projects = await prisma.project.findMany({
        where: { category: categoryName, deletedAt: null },
        include: {
          client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          invitations: {
            where: { status: 'ACCEPTED' },
            include: { freelancer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } }
          },
          escrow: true
        }
      });

      // Unique freelancers
      const freelancerMap = new Map<string, any>();
      projects.forEach(p => {
        (p as any).invitations?.forEach((inv: any) => {
          if (inv.freelancer && !freelancerMap.has(inv.freelancer.id)) {
            freelancerMap.set(inv.freelancer.id, inv.freelancer);
          }
        });
      });
      const freelancers = Array.from(freelancerMap.values());

      // Unique clients
      const clientMap = new Map<string, any>();
      projects.forEach(p => {
        const client = (p as any).client;
        if (client && !clientMap.has(client.id)) {
          clientMap.set(client.id, client);
        }
      });
      const clients = Array.from(clientMap.values());

      // Revenue
      const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget || 0), 0);
      const escrowHeld = projects.reduce((sum, p) => sum + Number((p as any).escrow?.amount || 0), 0);

      // Stats
      const stats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'IN_PROGRESS').length,
        completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
        totalFreelancers: freelancers.length,
        totalClients: clients.length,
        totalBudget,
        escrowHeld
      };

      res.json({
        success: true,
        data: {
          name: categoryName,
          stats,
          projects: projects.map(p => ({
            id: p.id, title: p.title, status: p.status, budget: p.budget,
            client: (p as any).client,
            freelancer: (p as any).invitations?.[0]?.freelancer || null,
            createdAt: p.createdAt
          })),
          freelancers,
          clients
        }
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  }

  // 12. Jobs Monitoring
  async getJobsMonitoring(req: Request, res: Response) {
    try {
      const { ProjectRepository } = require('../repositories/project.repository');
      const projectRepo = new ProjectRepository();
      
      const jobs = await prisma.project.findMany({
        where: { deletedAt: null },
        include: {
          client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          proposals: {
            include: {
              freelancer: {
                include: {
                  user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          escrow: true,
          disputes: {
            include: { initiator: { select: { id: true, firstName: true, lastName: true, email: true } } },
            orderBy: { createdAt: 'desc' }
          },
          reviews: { include: { reviewer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
          _count: { select: { proposals: true } },
        },
        orderBy: { createdAt: 'desc' }
      });
      
      const parsedJobs = jobs.map((j: any) => {
        const parsed = projectRepo.parseProjectMetadata(j);
        parsed.disputes = j.disputes;
        return parsed;
      });
      res.json({ success: true, data: parsedJobs });
    } catch (e: any) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  }

  // 13. Category CRUD (categories are derived from project.category strings)
  async createCategory(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: { message: 'Category name is required' } });
      }
      // Check if any project already uses this category
      const existing = await prisma.project.findFirst({ where: { category: name.trim(), deletedAt: null } });
      if (existing) {
        return res.status(400).json({ success: false, error: { message: 'Category already exists with active projects' } });
      }
      // We store categories as a settings entry since there's no Category model
      const { getSettings, saveSettings } = require('../utils/settings');
      const settings = getSettings();
      const customCategories: string[] = settings.customCategories || [];
      if (customCategories.includes(name.trim())) {
        return res.status(400).json({ success: false, error: { message: 'Category already exists' } });
      }
      customCategories.push(name.trim());
      saveSettings({ ...settings, customCategories });
      res.status(201).json({ success: true, data: { name: name.trim() }, message: 'Category created' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const categoryName = name as string;
      // Remove from settings custom categories
      const { getSettings, saveSettings } = require('../utils/settings');
      const settings = getSettings();
      const customCategories: string[] = settings.customCategories || [];
      const idx = customCategories.indexOf(categoryName);
      if (idx > -1) {
        customCategories.splice(idx, 1);
        saveSettings({ ...settings, customCategories });
      }
      res.json({ success: true, message: 'Category removed' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  }

  async renameCategory(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const categoryName = name as string;
      const { newName } = req.body;
      if (!newName || !newName.trim()) {
        return res.status(400).json({ success: false, error: { message: 'New category name is required' } });
      }
      // Update all projects that have this category
      await prisma.project.updateMany({
        where: { category: categoryName, deletedAt: null },
        data: { category: newName.trim() }
      });
      // Update settings custom categories
      const { getSettings, saveSettings } = require('../utils/settings');
      const settings = getSettings();
      const customCategories: string[] = settings.customCategories || [];
      const idx = customCategories.indexOf(categoryName);
      if (idx > -1) {
        customCategories[idx] = newName.trim();
      } else {
        customCategories.push(newName.trim());
      }
      saveSettings({ ...settings, customCategories });
      res.json({ success: true, message: 'Category renamed successfully' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  }

  // 14. Client Activity Detail
  async getClientActivity(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          clientProfile: true,
          projects: {
            where: { deletedAt: null },
            include: {
              proposals: {
                where: { status: 'ACCEPTED' },
                include: {
                  freelancer: {
                    include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } }
                  }
                }
              },
              escrow: true,
              _count: { select: { proposals: true, disputes: true, reviews: true } }
            },
            orderBy: { createdAt: 'desc' }
          },
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 20
          },
          reviewsGiven: {
            include: {
              project: { select: { id: true, title: true } },
              reviewee: { select: { id: true, firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ success: false, error: { message: 'User not found' } });
      }

      const totalSpent = user.transactions
        .filter(t => t.status === 'COMPLETED' && t.type === 'PAYMENT')
        .reduce((acc, t) => acc + Number(t.amount), 0);

      const { password, ...safeUser } = user as any;

      res.json({
        success: true,
        data: {
          ...safeUser,
          stats: {
            totalProjects: user.projects.length,
            activeProjects: user.projects.filter(p => p.status === 'IN_PROGRESS').length,
            completedProjects: user.projects.filter(p => p.status === 'COMPLETED').length,
            totalSpent,
            totalReviews: user.reviewsGiven.length
          }
        }
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  }

  // 15. Freelancer Activity Detail
  async getFreelancerActivity(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          freelancerProfile: {
            include: {
              skills: true,
              portfolios: true,
              certificates: true,
              proposals: {
                include: {
                  project: {
                    include: {
                      client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                      escrow: true,
                      _count: { select: { disputes: true, reviews: true } }
                    }
                  }
                },
                orderBy: { createdAt: 'desc' }
              }
            }
          },
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 20
          },
          reviewsReceived: {
            include: {
              project: { select: { id: true, title: true } },
              reviewer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ success: false, error: { message: 'User not found' } });
      }

      const totalEarned = user.transactions
        .filter(t => t.status === 'COMPLETED' && t.type === 'PAYMENT')
        .reduce((acc, t) => acc + Number(t.amount), 0);

      const proposals = user.freelancerProfile?.proposals || [];
      const acceptedProposals = proposals.filter(p => p.status === 'ACCEPTED');
      const completedProjects = acceptedProposals.filter(p => p.project.status === 'COMPLETED');

      const ratings = user.reviewsReceived.map(r => r.rating);
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

      const { password, ...safeUser } = user as any;

      res.json({
        success: true,
        data: {
          ...safeUser,
          stats: {
            totalProposals: proposals.length,
            acceptedProposals: acceptedProposals.length,
            completedProjects: completedProjects.length,
            totalEarned,
            avgRating: Math.round(avgRating * 10) / 10,
            totalReviews: ratings.length
          }
        }
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  }

  // Business Activity Detail
  async getBusinessActivity(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          businessProfile: true
        }
      });

      if (!user || !user.businessProfile) {
        return res.status(404).json({ success: false, error: { message: 'Business not found' } });
      }

      const bp = user.businessProfile;

      // Contracts
      const contracts = await prisma.contract.findMany({
        where: { businessId: bp.id },
        include: {
          worker: {
            select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true }
          },
          payrolls: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Financial summary
      let totalSpend = 0;
      let paidPayrolls = 0;
      let pendingPayrolls = 0;
      contracts.forEach(c => {
        c.payrolls.forEach(p => {
          totalSpend += p.totalAmount;
          if (p.status === 'PAID') paidPayrolls++;
          else pendingPayrolls++;
        });
      });

      const activeContracts = contracts.filter(c => c.status === 'ACTIVE');
      const uniqueWorkerIds = [...new Set(contracts.map(c => c.workerId))];

      // Attendance for these workers
      const attendanceRecords = await prisma.attendance.findMany({
        where: { workerId: { in: uniqueWorkerIds } },
        orderBy: { date: 'desc' },
        take: 20,
        include: { worker: { select: { firstName: true, lastName: true } } }
      });

      // Projects by this user
      const projects = await prisma.project.findMany({
        where: { clientId: id, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          proposals: { select: { id: true, status: true } }
        }
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
            status: user.status,
            isVerified: user.isVerified,
            createdAt: user.createdAt
          },
          businessProfile: bp,
          stats: {
            totalSpend,
            activeContracts: activeContracts.length,
            totalContracts: contracts.length,
            totalWorkers: uniqueWorkerIds.length,
            paidPayrolls,
            pendingPayrolls
          },
          contracts: contracts.map(c => ({
            id: c.id,
            worker: c.worker,
            employmentType: c.employmentType,
            monthlySalary: c.monthlySalary,
            platformFee: c.platformFee,
            status: c.status,
            startDate: c.startDate,
            payrollCount: c.payrolls.length
          })),
          projects,
          recentAttendance: attendanceRecords,
          workers: (() => {
            const workersMap = new Map<string, any>();
            contracts.forEach(c => {
              if (!workersMap.has(c.workerId)) {
                workersMap.set(c.workerId, {
                  id: c.worker.id,
                  firstName: c.worker.firstName,
                  lastName: c.worker.lastName,
                  email: c.worker.email,
                  avatarUrl: c.worker.avatarUrl,
                  totalEarned: 0,
                  activeJobs: 0,
                  completedJobs: 0,
                });
              }
              const w = workersMap.get(c.workerId);
              c.payrolls.forEach(p => {
                if (p.status === 'PAID') w.totalEarned += p.totalAmount;
              });
              if (c.status === 'ACTIVE') w.activeJobs++;
              if (c.status === 'CANCELLED') w.completedJobs++;
            });
            return Array.from(workersMap.values());
          })()
        }
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: { message: e.message } });
    }
  }
}
