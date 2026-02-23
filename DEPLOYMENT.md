# Deployment Guide for CTN (Critical Thinking Network)

## Vercel Deployment

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- PostgreSQL database (Neon, Supabase, or similar)
- MongoDB database (MongoDB Atlas)
- Cloudinary account for media uploads

### Environment Variables

You need to set these environment variables in your Vercel project settings:

#### Database Configuration
```
DATABASE_URL=your_postgresql_connection_string
MONGODB_URI=your_mongodb_connection_string
```

#### Redis Configuration (Optional)
```
REDIS_HOST=your_redis_host
REDIS_PORT=6379
```

#### JWT Configuration
```
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRATION=7d
```

#### API Configuration
```
API_PORT=3001
FRONTEND_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
```

#### File Upload
```
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

#### Email Configuration (SMTP)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### Cloudinary Configuration
```
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Deployment Steps

1. **Connect Repository to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all the variables listed above

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

### Post-Deployment

1. **Seed Database** (Optional)
   ```bash
   # Run locally with production database
   npm run seed:real-users
   ```

2. **Verify Deployment**
   - Check frontend: `https://your-app.vercel.app`
   - Check API health: `https://your-app.vercel.app/api/health`

### Troubleshooting

#### Build Errors
- Check build logs in Vercel dashboard
- Ensure all dependencies are listed in package.json
- Verify Node.js version matches .nvmrc

#### Runtime Errors
- Check Function Logs in Vercel dashboard
- Verify environment variables are set correctly
- Check database connection strings

#### Static Generation Errors
- Pages with `export const dynamic = 'force-dynamic'` will be rendered on-demand
- This is expected for pages using client-side features

### Performance Optimization

1. **Enable Edge Functions** (Optional)
   - Add `export const runtime = 'edge'` to API routes for faster response times

2. **Configure Caching**
   - Static assets are automatically cached by Vercel CDN
   - API responses can be cached using `Cache-Control` headers

3. **Monitor Performance**
   - Use Vercel Analytics to track performance
   - Monitor function execution times

### Security

1. **Environment Variables**
   - Never commit `.env` files to Git
   - Use Vercel's encrypted environment variables

2. **API Security**
   - CORS is configured for your frontend domain
   - JWT tokens are used for authentication
   - Rate limiting should be implemented for production

### Continuous Deployment

- Vercel automatically deploys on every push to `main` branch
- Preview deployments are created for pull requests
- You can configure deployment branches in Vercel settings

### Support

For issues or questions:
- Check Vercel documentation: https://vercel.com/docs
- Review build logs in Vercel dashboard
- Check application logs for runtime errors

## Alternative Deployment Options

### Docker Deployment
See `docker-compose.yml` for containerized deployment

### Traditional Hosting
1. Build frontend: `cd frontend && npm run build`
2. Build backend: `cd backend && npm run build`
3. Deploy built files to your hosting provider
4. Configure reverse proxy (nginx/Apache)
5. Set up process manager (PM2)

### Cloud Platforms
- AWS: Use Elastic Beanstalk or ECS
- Google Cloud: Use App Engine or Cloud Run
- Azure: Use App Service
