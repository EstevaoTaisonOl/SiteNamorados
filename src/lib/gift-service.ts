import { supabase } from "./supabase";

export async function uploadFileToSupabase(file: File, path: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('gifts-memories')
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('gifts-memories')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function createGiftInSupabase(giftData: any) {
  const { data, error } = await supabase
    .from('gifts')
    .insert([{
      sender_name: giftData.senderName,
      sender_email: giftData.senderEmail,
      recipient_name: giftData.recipientName,
      intro_message: giftData.introMessage,
      music_preview_url: giftData.musicPreviewUrl,
      music_name: giftData.musicName,
      stories: giftData.stories,
      journey: giftData.journey,
      is_paid: false
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markGiftAsPaid(id: string) {
  const { data, error } = await supabase
    .from('gifts')
    .update({ is_paid: true, paid_at: new Date().toISOString() })
    .match({ id });

  if (error) throw error;
  return data;
}
