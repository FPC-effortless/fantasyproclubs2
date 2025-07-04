import type { Notification } from '@/types/database'
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

/**
 * Create a notification
 * @param notification - Notification data
 * @returns Created notification
 */
export const createNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>): Promise<Notification> => {
  const { data, error } = await supabase
    .from('notifications')
    .insert([notification])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Mark a notification as read
 * @param notificationId - Notification ID
 * @returns Updated notification
 */
export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a notification
 * @param notificationId - Notification ID
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) throw error
}

/**
 * Get all notifications for a user
 * @param userId - User ID
 * @returns Array of notifications
 */
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get unread notifications for a user
 * @param userId - User ID
 * @returns Array of unread notifications
 */
export const getUnreadNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Create a match notification
 * @param userId - User ID
 * @param matchId - Match ID
 * @param type - Notification type
 * @param message - Notification message
 * @returns Created notification
 */
export const createMatchNotification = async (
  userId: string,
  matchId: string,
  type: 'match_start' | 'match_end' | 'match_update',
  message: string
): Promise<Notification> => {
  return createNotification({
    user_id: userId,
    type: 'match',
    title: 'Match Update',
    message,
    read: false,
    link: `/matches/${matchId}`,
  })
}

/**
 * Create a transfer notification
 * @param userId - User ID
 * @param transferId - Transfer ID
 * @param type - Notification type
 * @param message - Notification message
 * @returns Created notification
 */
export const createTransferNotification = async (
  userId: string,
  transferId: string,
  type: 'transfer_request' | 'transfer_approved' | 'transfer_rejected',
  message: string
): Promise<Notification> => {
  return createNotification({
    user_id: userId,
    type: 'transfer',
    title: 'Transfer Update',
    message,
    read: false,
    link: `/transfers/${transferId}`,
  })
}

/**
 * Create an award notification
 * @param userId - User ID
 * @param awardId - Award ID
 * @param type - Notification type
 * @param message - Notification message
 * @returns Created notification
 */
export const createAwardNotification = async (
  userId: string,
  awardId: string,
  type: 'award_received' | 'award_nominated',
  message: string
): Promise<Notification> => {
  return createNotification({
    user_id: userId,
    type: 'award',
    title: 'Award Update',
    message,
    read: false,
    link: `/awards/${awardId}`,
  })
}

/**
 * Create a system notification
 * @param userId - User ID
 * @param title - Notification title
 * @param message - Notification message
 * @param link - Optional link
 * @returns Created notification
 */
export const createSystemNotification = async (
  userId: string,
  title: string,
  message: string,
  link?: string
): Promise<Notification> => {
  return createNotification({
    user_id: userId,
    type: 'system',
    title,
    message,
    read: false,
    link,
  })
}

/**
 * Mark all notifications as read for a user
 * @param userId - User ID
 * @returns Updated notifications
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)
    .select()

  if (error) throw error
  return data
}

/**
 * Delete all notifications for a user
 * @param userId - User ID
 */
export const deleteAllNotifications = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
}

/**
 * Get notification count for a user
 * @param userId - User ID
 * @returns Number of notifications
 */
export const getNotificationCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw error
  return count || 0
}

/**
 * Get unread notification count for a user
 * @param userId - User ID
 * @returns Number of unread notifications
 */
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) throw error
  return count || 0
} 
