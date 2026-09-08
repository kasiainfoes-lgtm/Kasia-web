// Nombres de las cookies (httpOnly) que conectan /apply -> /apply/result -> /signup.
// APP_ID_COOKIE guarda el id real cuando Supabase está configurado; el
// resultado y el estado se vuelven a leer de la base de datos cada vez, nunca
// se confía en nada que venga del cliente.
// APP_DEMO_STATUS_COOKIE es el respaldo en modo demo (sin Supabase todavía),
// donde no hay dónde persistir la solicitud: guarda el estado ya calculado.
export const APP_ID_COOKIE = 'vivi_app_id';
export const APP_DEMO_STATUS_COOKIE = 'vivi_app_demo_status';

export const APP_COOKIE_MAX_AGE = 60 * 60; // 1 hora: alcanza para terminar el alta
