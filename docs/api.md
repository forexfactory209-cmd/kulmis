# API Documentation Standards

## Base URL
`/api/v1/`

## Response Structure
All API responses must follow this standard JSON structure:

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Resource retrieved successfully"
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [ ... ]
  }
}
```

## Authentication
Use Bearer Token in the `Authorization` header:
`Authorization: Bearer <JWT_ACCESS_TOKEN>`

## Pagination Rules
For list endpoints, use `page` and `limit` query parameters.
```
GET /api/v1/projects?page=1&limit=20
```

## HTTP Status Codes
- `200 OK`: Success.
- `201 Created`: Resource created.
- `400 Bad Request`: Validation or logic error.
- `401 Unauthorized`: Authentication failed.
- `403 Forbidden`: Insufficient permissions.
- `404 Not Found`: Resource does not exist.
- `500 Internal Server Error`: Unexpected server error.

## Filtering and Searching
Use query parameters for filtering:
`GET /api/v1/freelancers?skill=typescript&minRate=50`
