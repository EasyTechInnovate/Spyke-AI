'use client'
import { AnimatePresence } from 'framer-motion'
import Notification from './Notification'
export default function NotificationContainer({ notifications, onClose }) {
    if (!notifications || notifications.length === 0) return null
    return (
        <div className="fixed top-6 right-6 z-[60] space-y-3 pointer-events-none">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <div key={notification.id} className="pointer-events-auto">
                        <Notification
                            {...notification}
                            onClose={onClose}
                            onClick={onClose}
                        />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    )
}