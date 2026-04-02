import { supabase } from './supabase'

export const initLibrary = () => {
  if (!localStorage.getItem('chromator_likes')) {
    localStorage.setItem('chromator_likes', JSON.stringify([])); 
  }
};

export const getLibrary = async (type) => {
  try {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map Supabase fields to the app's existing structure
    return data.map(item => ({
      id: item.id,
      timestamp: item.created_at,
      type: item.type,
      data: item.data,
      name: item.name || null, // Capture name column
      likes: item.likes_count || 0
    }));
  } catch(e) {
    console.error('Error fetching from Supabase:', e);
    return []; 
  }
};

export const saveToLibrary = async (type, payload, name) => {
  try {
    if (!supabase) return false;

    const { data, error } = await supabase
      .from('gallery')
      .insert([
        { type, data: payload, name }
      ])
      .select();

    if (error) throw error;
    return true;
  } catch(e) {
    console.error('Error saving to Supabase:', e);
    return false;
  }
};

export const likeItem = async (id) => {
  try {
    if (!supabase) return false;

    const likesDB = JSON.parse(localStorage.getItem('chromator_likes')) || [];
    if (likesDB.includes(id)) return false; 
    
    // Update Supabase (Increment likes_count)
    const { data: item, error: fetchError } = await supabase.from('gallery').select('likes_count').eq('id', id).single();
    if (fetchError) throw fetchError;

    const { error: updateError } = await supabase
      .from('gallery')
      .update({ likes_count: (item.likes_count || 0) + 1 })
      .eq('id', id);

    if (updateError) throw updateError;

    // Track locally
    likesDB.push(id);
    localStorage.setItem('chromator_likes', JSON.stringify(likesDB));
    return true;
  } catch(e) {
    console.error('Error liking item in Supabase:', e);
    return false;
  }
};

export const hasLiked = (id) => {
  try {
    const likesDB = JSON.parse(localStorage.getItem('chromator_likes')) || [];
    return likesDB.includes(id);
  } catch(e) { return false; }
};

// --- Personal Library (Private) ---

export const getUserLibrary = async (type) => {
  try {
    if (!supabase) return [];
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_saves')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      timestamp: item.created_at,
      type: item.type,
      data: item.data,
      name: item.name || 'Untitled'
    }));
  } catch(e) {
    console.error('Error fetching from Personal Library:', e);
    return []; 
  }
};

export const saveToUserLibrary = async (type, payload, name) => {
  try {
    if (!supabase) return false;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_saves')
      .insert([
        { type, data: payload, name, user_id: user.id }
      ])
      .select();

    if (error) throw error;
    return true;
  } catch(e) {
    console.error('Error saving to Personal Library:', e);
    return false;
  }
};

export const deleteUserSave = async (id) => {
  try {
    if (!supabase) return false;

    const { error } = await supabase
      .from('user_saves')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch(e) {
    console.error('Error deleting from Personal Library:', e);
    return false;
  }
};
