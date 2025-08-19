import express from "express";
import isAuth from "../middleware/isAuth";

import * as MobileAuthController from "../controllers/Mobile/MobileAuthController";
import * as MobileTicketController from "../controllers/Mobile/MobileTicketController";
import * as MobileMessageController from "../controllers/Mobile/MobileMessageController";
import * as MobileContactController from "../controllers/Mobile/MobileContactController";
import * as MobileUserController from "../controllers/Mobile/MobileUserController";
import * as MobilePushController from "../controllers/Mobile/MobilePushController";
import * as MobileOfflineController from "../controllers/Mobile/MobileOfflineController";

const mobileRoutes = express.Router();

// Authentication routes
mobileRoutes.post("/auth/login", MobileAuthController.login);
mobileRoutes.post("/auth/refresh", MobileAuthController.refreshToken);
mobileRoutes.post("/auth/logout", isAuth, MobileAuthController.logout);

// User profile and settings
mobileRoutes.get("/user/profile", isAuth, MobileUserController.getProfile);
mobileRoutes.put("/user/profile", isAuth, MobileUserController.updateProfile);
mobileRoutes.get("/user/settings", isAuth, MobileUserController.getSettings);

// Push notification management
mobileRoutes.post("/user/push-token", isAuth, MobilePushController.registerPushToken);
mobileRoutes.delete("/user/push-token", isAuth, MobilePushController.unregisterPushToken);
mobileRoutes.get("/user/notifications", isAuth, MobilePushController.getNotifications);
mobileRoutes.put("/user/notifications/:id/read", isAuth, MobilePushController.markNotificationAsRead);

// Tickets - mobile optimized endpoints
mobileRoutes.get("/tickets", isAuth, MobileTicketController.index);
mobileRoutes.get("/tickets/:ticketId", isAuth, MobileTicketController.show);
mobileRoutes.put("/tickets/:ticketId", isAuth, MobileTicketController.update);
mobileRoutes.post("/tickets/:ticketId/transfer", isAuth, MobileTicketController.transfer);
mobileRoutes.post("/tickets/:ticketId/close", isAuth, MobileTicketController.close);
mobileRoutes.get("/tickets/:ticketId/stats", isAuth, MobileTicketController.getStats);

// Messages - mobile optimized endpoints
mobileRoutes.get("/tickets/:ticketId/messages", isAuth, MobileMessageController.index);
mobileRoutes.post("/tickets/:ticketId/messages", isAuth, MobileMessageController.store);
mobileRoutes.post("/tickets/:ticketId/messages/media", isAuth, MobileMessageController.sendMedia);
mobileRoutes.post("/tickets/:ticketId/messages/voice", isAuth, MobileMessageController.sendVoice);
mobileRoutes.post("/tickets/:ticketId/messages/location", isAuth, MobileMessageController.sendLocation);
mobileRoutes.put("/messages/:messageId/read", isAuth, MobileMessageController.markAsRead);

// Contacts - mobile optimized endpoints
mobileRoutes.get("/contacts", isAuth, MobileContactController.index);
mobileRoutes.get("/contacts/search", isAuth, MobileContactController.search);
mobileRoutes.get("/contacts/:contactId", isAuth, MobileContactController.show);
mobileRoutes.put("/contacts/:contactId", isAuth, MobileContactController.update);
mobileRoutes.get("/contacts/:contactId/tickets", isAuth, MobileContactController.getTickets);

// Quick access endpoints
mobileRoutes.get("/quick/recent-tickets", isAuth, MobileTicketController.getRecentTickets);
mobileRoutes.get("/quick/pending-tickets", isAuth, MobileTicketController.getPendingTickets);
mobileRoutes.get("/quick/my-tickets", isAuth, MobileTicketController.getMyTickets);
mobileRoutes.get("/quick/quick-messages", isAuth, MobileMessageController.getQuickMessages);
mobileRoutes.get("/quick/dashboard", isAuth, MobileUserController.getDashboard);

// Offline sync endpoints
mobileRoutes.post("/sync/tickets", isAuth, MobileOfflineController.syncTickets);
mobileRoutes.post("/sync/messages", isAuth, MobileOfflineController.syncMessages);
mobileRoutes.get("/sync/status", isAuth, MobileOfflineController.getSyncStatus);
mobileRoutes.post("/sync/queue", isAuth, MobileOfflineController.processOfflineQueue);

// Real-time status endpoints
mobileRoutes.get("/status/whatsapp", isAuth, MobileUserController.getWhatsAppStatus);
mobileRoutes.get("/status/queues", isAuth, MobileUserController.getQueues);
mobileRoutes.get("/status/online-users", isAuth, MobileUserController.getOnlineUsers);

export default mobileRoutes;