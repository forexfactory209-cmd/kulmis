import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class UploadController {
  /**
   * Upload a profile avatar. Updates User.avatarUrl.
   */
  async uploadProfileImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
        return;
      }

      const userId = req.user!.userId;
      const fileUrl = `/public/uploads/profiles/${req.file.filename}`;

      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: fileUrl },
      });

      res.status(200).json({
        success: true,
        data: { url: fileUrl },
        message: 'Profile image uploaded successfully',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  /**
   * Upload a portfolio image. Creates or updates a Portfolio entry.
   */
  async uploadPortfolioImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
        return;
      }

      const userId = req.user!.userId;
      const fileUrl = `/public/uploads/portfolios/${req.file.filename}`;
      const { title, description, portfolioId } = req.body;

      // Find the freelancer profile
      const profile = await prisma.freelancerProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        res.status(404).json({ success: false, error: { message: 'Freelancer profile not found' } });
        return;
      }

      let portfolio;
      if (portfolioId) {
        // Update existing
        portfolio = await prisma.portfolio.update({
          where: { id: portfolioId },
          data: { imageUrl: fileUrl, ...(title && { title }), ...(description && { description }) },
        });
      } else {
        // Create new
        portfolio = await prisma.portfolio.create({
          data: {
            freelancerId: profile.id,
            title: title || 'Untitled',
            description: description || null,
            imageUrl: fileUrl,
          },
        });
      }

      res.status(200).json({
        success: true,
        data: portfolio,
        message: 'Portfolio image uploaded successfully',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  /**
   * Upload a certificate image. Creates or updates a Certificate entry.
   */
  async uploadCertificateImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
        return;
      }

      const userId = req.user!.userId;
      const fileUrl = `/public/uploads/certificates/${req.file.filename}`;
      const { name, issuingOrg, certificateId } = req.body;

      const profile = await prisma.freelancerProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        res.status(404).json({ success: false, error: { message: 'Freelancer profile not found' } });
        return;
      }

      let certificate;
      if (certificateId) {
        certificate = await prisma.certificate.update({
          where: { id: certificateId },
          data: { imageUrl: fileUrl, ...(name && { name }), ...(issuingOrg && { issuingOrg }) },
        });
      } else {
        certificate = await prisma.certificate.create({
          data: {
            freelancerId: profile.id,
            name: name || 'Untitled Certificate',
            issuingOrg: issuingOrg || 'Unknown',
            imageUrl: fileUrl,
          },
        });
      }

      res.status(200).json({
        success: true,
        data: certificate,
        message: 'Certificate image uploaded successfully',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  /**
   * Generic file upload — just returns the URL without updating any model.
   * Useful for admin uploading images for freelancers, etc.
   */
  async uploadGenericImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
        return;
      }

      const uploadType = (req as any).uploadType || 'profiles';
      const fileUrl = `/public/uploads/${uploadType}/${req.file.filename}`;

      res.status(200).json({
        success: true,
        data: { url: fileUrl },
        message: 'File uploaded successfully',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
}
