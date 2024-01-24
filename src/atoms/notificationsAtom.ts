import { Timestamp } from "firebase/firestore";
import { atom } from "recoil";

export type Notification = {
    id?: string;
    notifyBy: string;
    notifyTo: string;
    notification: string;
    isRead: string;
    notificationType: string;
}