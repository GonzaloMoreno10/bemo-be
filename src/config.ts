import { registerAs } from '@nestjs/config';
//*Variables de entorno tipadas
export default registerAs('config', () => {
  return {
    database: {
      dbUser: process.env.DB_USER,
      dbName: process.env.DB_NAME,
      dbPassword: process.env.DB_PASSWORD,
      dbPort: parseInt(process.env.DB_PORT),
      dbHost: process.env.DB_HOST,
    },
    tableConfig: {
      default_user_audit: process.env.DEFAULT_USER_AUDIT,
      default_audit_fields: process.env.DEFAULT_AUDIT_FIELDS,
      default_hast_trigger: process.env.DEFAULT_HAS_TRIGGER,
      default_delete_strategie: process.env.DEFAULT_DELETE_STRATEGIE,
      default_allow_null: process.env.DEFAULT_ALLOW_NULL,
      default_filterable: process.env.DEFAULT_FILTERABLE,
      default_sortable: process.env.DEFAULT_SORTABLE,
      default_deletable: process.env.DEFAULT_DELETABLE,
      default_roles_admited: process.env.DEFAULT_ROLES_ADMITED,
      default_deleteable: process.env.DEFAULT_DELETEABLE,
      default_updateable: process.env.DEFAULT_UPDATEABLE,
      default_queryable: process.env.DEFAULT_QUERYABLE,
    },
    google: {
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
      googleCallBackUrl: process.env.GOOGLE_CALLBACK_URL,
    },
    apiKey: process.env.API_KEY,
    jwtSecret: process.env.JWT_SECRET,
  };
});
