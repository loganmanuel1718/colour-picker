export const initLibrary = () => {
  if (!localStorage.getItem('chromator_lib')) {
    const initialDB = {
      palette: [
        { id: 'p1', likes: 432, timestamp: Date.now() - 10000, data: [{id:'1', hex: '#1e293b', isLocked: false}, {id:'2', hex: '#3b82f6', isLocked: false}, {id:'3', hex: '#8b5cf6', isLocked: false}, {id:'4', hex: '#f472b6', isLocked: false}, {id:'5', hex: '#f8fafc', isLocked: false}] },
        { id: 'p2', likes: 112, timestamp: Date.now() - 20000, data: [{id:'1', hex: '#ef4444', isLocked: false}, {id:'2', hex: '#f97316', isLocked: false}, {id:'3', hex: '#facc15', isLocked: false}, {id:'4', hex: '#a3e635', isLocked: false}, {id:'5', hex: '#22c55e', isLocked: false}] },
        { id: 'p3', likes: 89, timestamp: Date.now() - 30000, data: [{id:'1', hex: '#0f172a', isLocked: false}, {id:'2', hex: '#334155', isLocked: false}, {id:'3', hex: '#64748b', isLocked: false}, {id:'4', hex: '#94a3b8', isLocked: false}, {id:'5', hex: '#e2e8f0', isLocked: false}] }
      ],
      gradient: [],
      glass: [],
      contrast: []
    };
    localStorage.setItem('chromator_lib', JSON.stringify(initialDB));
    localStorage.setItem('chromator_likes', JSON.stringify([])); 
  }
};

export const getLibrary = (type) => {
  try {
    const db = JSON.parse(localStorage.getItem('chromator_lib'));
    return db[type] || [];
  } catch(e) { return []; }
};

export const saveToLibrary = (type, payload) => {
  try {
    const db = JSON.parse(localStorage.getItem('chromator_lib'));
    db[type].unshift({ id: 'item_' + Date.now().toString(), likes: 0, timestamp: Date.now(), data: payload });
    localStorage.setItem('chromator_lib', JSON.stringify(db));
  } catch(e) {}
};

export const likeItem = (type, id) => {
  try {
    const likesDB = JSON.parse(localStorage.getItem('chromator_likes')) || [];
    if (likesDB.includes(id)) return false; 
    likesDB.push(id);
    localStorage.setItem('chromator_likes', JSON.stringify(likesDB));
    
    const db = JSON.parse(localStorage.getItem('chromator_lib'));
    const item = db[type].find(x => x.id === id);
    if (item) item.likes++;
    localStorage.setItem('chromator_lib', JSON.stringify(db));
    return true;
  } catch(e) { return false; }
};

export const hasLiked = (id) => {
  try {
    const likesDB = JSON.parse(localStorage.getItem('chromator_likes')) || [];
    return likesDB.includes(id);
  } catch(e) { return false; }
};
