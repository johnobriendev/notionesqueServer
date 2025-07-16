// src/routes/teamRoutes.ts
import { Router } from 'express';
import { checkJwt, extractUserInfo } from '../middleware/auth';
import {
  inviteUserToProject,
  getUserInvitations,
  acceptInvitation,
  declineInvitation,
  getProjectCollaborators,
  removeTeamMember,
  updateMemberRole
} from '../controllers/teamController';
import { inviteRateLimit } from '../middleware/rateLimiter';

const router = Router();

// Apply authentication to all routes
router.use(checkJwt);
router.use(extractUserInfo);


router.post('/projects/:id/invite',inviteRateLimit as any, inviteUserToProject as any);

router.get('/users/invitations', getUserInvitations as any);

router.post('/invitations/:token/accept', acceptInvitation as any);

router.delete('/invitations/:id', declineInvitation as any);

router.get('/projects/:id/collaborators', getProjectCollaborators as any);

router.delete('/projects/:id/collaborators/:userId', removeTeamMember as any);

router.put('/projects/:id/collaborators/:userId/role', updateMemberRole as any);

export default router;