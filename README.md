<<<<<<< HEAD
"# SAN" 
=======

# SecureAid Network - Biometric Aid Distribution System

## Project Overview

SecureAid Network is a comprehensive biometric aid distribution system designed for humanitarian organizations. The platform facilitates secure and efficient allocation of aid resources to beneficiaries through a multi-user system with distinct roles and responsibilities. The system prevents fraud through biometric identification and maintains detailed allocation records.

## System Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript, Vite
- **UI Components**: Tailwind CSS with shadcn/ui component library
- **Backend**: Supabase for database, authentication, and storage
- **State Management**: React Query for server state, React Context for application state
- **Routing**: React Router v6

### Database Schema

The system uses the following core tables in Supabase:

1. **`admins`**
   - `id`: UUID (primary key)
   - `username`: Text (unique identifier)
   - `password`: Text (plain text for demo purposes, should be hashed in production)
   - `name`: Text
   - `created_at`: Timestamp

2. **`regions`**
   - `id`: UUID (primary key)
   - `name`: Text
   - `created_at`: Timestamp

3. **`disbursers`**
   - `id`: UUID (primary key)
   - `name`: Text
   - `phone_number`: Text (used as login credential)
   - `password`: Text
   - `region_id`: UUID (references regions)
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

4. **`beneficiaries`**
   - `id`: UUID (primary key)
   - `name`: Text
   - `height`: Number (optional)
   - `estimated_age`: Number (optional)
   - `unique_identifiers`: JSON (stores biometric/unique identifiers)
   - `registered_by`: UUID (refers to disburser who registered)
   - `region_id`: UUID (references regions)
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

5. **`goods_types`**
   - `id`: UUID (primary key)
   - `name`: Text
   - `description`: Text (optional)
   - `created_at`: Timestamp

6. **`regional_goods`**
   - `id`: UUID (primary key)
   - `goods_type_id`: UUID (references goods_types)
   - `region_id`: UUID (references regions)
   - `quantity`: Number
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

7. **`allocations`**
   - `id`: UUID (primary key)
   - `beneficiary_id`: UUID (references beneficiaries)
   - `disburser_id`: UUID (references disbursers)
   - `goods`: JSON (details of allocated goods)
   - `location`: JSON (GPS coordinates)
   - `allocated_at`: Timestamp

8. **`fraud_alerts`**
   - `id`: UUID (primary key)
   - `beneficiary_id`: UUID (references beneficiaries)
   - `disburser_id`: UUID (references disbursers)
   - `location`: JSON (GPS coordinates)
   - `details`: Text (optional)
   - `attempted_at`: Timestamp

### Row-Level Security Policies

The system implements comprehensive Row-Level Security (RLS) policies in Supabase:

- Anonymous users can read but not write most tables
- Service role has full access to all tables
- Anonymous users can insert initial setup data for bootstrapping the system

## Authentication System

The application uses a custom authentication system built on top of Supabase:

1. **Role-based Authentication**:
   - **Admin**: Logs in with username and password
   - **Disburser**: Logs in with phone number and password

2. **Authentication Flow**:
   - User selects role type
   - Enters credentials
   - System validates against appropriate table
   - Upon successful login, user info and role is stored in local storage
   - Auth provider context maintains auth state throughout the app

3. **Session Management**:
   - Uses React Context to manage authentication state
   - Stores minimal user details for role-based access control
   - Automatically redirects to appropriate dashboard based on role

## Core Features

### Admin Features
1. **Disburser Management**
   - Create, view, edit and delete disbursers
   - Assign disbursers to specific regions

2. **Resource Management** (partially implemented)
   - Manage goods types and inventory
   - Allocate resources to regions

### Disburser Features
1. **Beneficiary Registration**
   - Register new beneficiaries with biometric identifiers
   - Record basic demographic information

2. **Aid Allocation**
   - Verify beneficiary identity
   - Record aid allocation with automatic fraud detection
   - Track inventory updates in real-time

### Fraud Prevention
1. **Biometric Verification**
   - Uses unique identifiers to prevent duplicate aid allocation
   - Validates beneficiary identity before distribution

2. **Fraud Alerts**
   - System automatically logs suspicious allocation attempts
   - Administrators can review fraud alerts

## Project Structure

```
src/
├── App.tsx                    # Main application component and routing
├── components/
│   ├── auth/                  # Authentication components
│   ├── layout/                # Layout components (sidebars, nav)
│   └── ui/                    # UI components (shadcn/ui)
├── hooks/                     # Custom React hooks
│   ├── useAuth.tsx           # Authentication hook
│   ├── useUserRole.tsx       # Role management hook
│   └── useUserInfo.tsx       # User information hook
├── integrations/
│   └── supabase/             # Supabase integration
├── pages/
│   ├── Login.tsx             # Login page
│   ├── admin/                # Admin pages
│   └── disburser/            # Disburser pages
├── services/                  # API service layer
│   ├── adminService.ts       # Admin-related API calls
│   └── disburserService.ts   # Disburser-related API calls
├── types/                     # TypeScript type definitions
└── lib/                       # Utility functions
```

## Authentication Flow

1. User visits the login page (`/`)
2. User selects role (admin or disburser)
3. User enters credentials
4. System validates credentials against appropriate table
5. Upon successful login:
   - User info and role is stored in local storage
   - User is redirected to appropriate dashboard
6. Protected routes check authentication status with `ProtectedRoute` component

## State Management

1. **Auth State**:
   - `AuthProvider` manages authentication state
   - `useAuth` hook provides authentication context to components

2. **User Role and Info**:
   - `useUserRole` hook manages user role
   - `useUserInfo` hook manages user information

3. **Server State**:
   - TanStack Query (React Query) manages server state
   - Custom service functions for API calls

## Default Accounts

For demonstration purposes, the system creates default accounts on initial startup:

1. **Admin**:
   - Username: `admin`
   - Password: `NGO123`

2. **Disburser**:
   - Phone: `1234567890`
   - Password: `pass123`

## Development Setup

1. **Prerequisites**:
   - Node.js (v16+)
   - npm, yarn, or bun package manager
   - Supabase account with a new project

2. **Environment Configuration**:
   - Supabase URL and key are configured in `src/integrations/supabase/client.ts`

3. **Installation**:
   ```bash
   # Clone the repository
   git clone [repository-url]

   # Navigate to project directory
   cd secure-aid-network

   # Install dependencies
   npm install

   # Start development server
   npm run dev
   ```

4. **Supabase Setup**:
   - Create a new Supabase project
   - Run the database migration scripts to create tables and policies
   - Update the Supabase URL and key in the client configuration

## Security Considerations

1. **Current Limitations** (Demo Version):
   - Passwords are stored in plain text (should be hashed in production)
   - No JWT token-based authentication
   - Limited biometric verification implementation

2. **Production Recommendations**:
   - Implement proper password hashing
   - Use JWT tokens for authentication
   - Enhanced biometric validation
   - Encrypted communications
   - Implement rate limiting and brute force protection

## Mobile Responsiveness

The application is designed to be fully responsive:
- Desktop view: Full sidebar navigation
- Mobile view: Bottom navigation bar
- Responsive form and card layouts
- Touch-friendly UI elements

## Key Design Patterns

1. **Context API** for state management
2. **Custom Hooks** for shared logic
3. **Service Layer** for API communication
4. **Protected Routes** for access control
5. **Component Composition** for UI elements

## Extending the System

### Adding New Features

1. **New User Role**:
   - Add new role type in auth context
   - Create new table in Supabase
   - Add relevant RLS policies
   - Create new routes and components

2. **New Resource Type**:
   - Add to goods_types table
   - Create UI for managing the new type
   - Update allocation interfaces

### Customizing the UI

1. **Theme**:
   - Update colors in Tailwind configuration
   - Modify component styles in shadcn/ui components

2. **Layout**:
   - Customize sidebar in AdminSidebar.tsx or DisburserSidebar.tsx
   - Modify page layouts in individual page components

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Check Supabase RLS policies
   - Verify credentials match database records
   - Check browser console for detailed error messages

2. **Database Access Issues**:
   - Verify Supabase API keys
   - Check RLS policies for appropriate access
   - Review query parameters in service functions

3. **UI Rendering Issues**:
   - Check for React key warnings
   - Verify component prop types
   - Inspect browser console for errors

## Deployment

The application can be deployed using various hosting services:

1. **Static Hosting**:
   - Build the project: `npm run build`
   - Deploy the `dist` folder to Netlify, Vercel, or GitHub Pages

2. **Container Deployment**:
   - Package the application in a Docker container
   - Deploy to services like AWS, GCP, or Azure

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Credits

- Built with [React](https://reactjs.org/)
- UI components by [shadcn/ui](https://ui.shadcn.com/)
- Database and backend by [Supabase](https://supabase.io/)
- Icons from [Lucide](https://lucide.dev/)
>>>>>>> d9b1f99 (Initial commit from nas repo commit 3c2c313)
