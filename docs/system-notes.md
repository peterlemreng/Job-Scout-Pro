# Job Scout Pro - System Notes

## Stable recovery points
- Branch: stable-backup
- Tag: v1-stable

## Current working features
- Admin login works
- Forgot password OTP flow works
- Paid job draft creation works
- Payment submission works
- Admin payment approval works
- Approved payments publish jobs
- Employer dashboard works
- Payment records page works
- Public jobs hide expired jobs

## Important routes
- /api/auth
- /api/jobs
- /api/payments
- /api/applications
- /api/admin
- /api/employer

## Current monetization flow
- Basic Job Post
- KES 799
- 30 days
- Admin reviews submitted payment before publishing

## Safety rule
- Change one file at a time
- Test before push
- Keep stable working flows untouched unless necessary
