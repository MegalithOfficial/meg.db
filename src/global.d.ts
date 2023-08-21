export type Timezones = "Pacific/Niue" | "Pacific/Pago_Pago" | "Pacific/Honolulu" | "Pacific/Rarotonga" | "Pacific/Tahiti" | "Pacific/Marquesas" | "America/Anchorage" | "Pacific/Gambier" | "America/Los_Angeles" | "America/Tijuana" | "America/Vancouver" | "America/Whitehorse" | "Pacific/Pitcairn" | "America/Dawson_Creek" | "America/Denver" | "America/Edmonton" | "America/Hermosillo" | "America/Mazatlan" | "America/Phoenix" | "America/Yellowknife" | "America/Belize" | "America/Chicago" | "America/Costa_Rica" | "America/El_Salvador" | "America/Guatemala" | "America/Managua" | "America/Mexico_City" | "America/Regina" | "America/Tegucigalpa" | "America/Winnipeg" | "Pacific/Galapagos" | "America/Bogota" | "America/Cancun" | "America/Cayman" | "America/Guayaquil" | "America/Havana" | "America/Iqaluit" | "America/Jamaica" | "America/Lima" | "America/Nassau" | "America/New_York" | "America/Panama" | "America/Port-au-Prince" | "America/Rio_Branco" | "America/Toronto" | "Pacific/Easter" | "America/Caracas" | "America/Asuncion" | "America/Barbados" | "America/Boa_Vista" | "America/Campo_Grande" | "America/Cuiaba" | "America/Curacao" | "America/Grand_Turk" | "America/Guyana" | "America/Halifax" | "America/La_Paz" | "America/Manaus" | "America/Martinique" | "America/Port_of_Spain" | "America/Porto_Velho" | "America/Puerto_Rico" | "America/Santo_Domingo" | "America/Thule" | "Atlantic/Bermuda" | "America/St_Johns" | "America/Araguaina" | "America/Argentina/Buenos_Aires" | "America/Bahia" | "America/Belem" | "America/Cayenne" | "America/Fortaleza" | "America/Godthab" | "America/Maceio" | "America/Miquelon" | "America/Montevideo" | "America/Paramaribo" | "America/Recife" | "America/Santiago" | "America/Sao_Paulo" | "Antarctica/Palmer" | "Antarctica/Rothera" | "Atlantic/Stanley" | "America/Noronha" | "Atlantic/South_Georgia" | "America/Scoresbysund" | "Atlantic/Azores" | "Atlantic/Cape_Verde" | "Africa/Abidjan" | "Africa/Accra" | "Africa/Bissau" | "Africa/Casablanca" | "Africa/El_Aaiun" | "Africa/Monrovia" | "America/Danmarkshavn" | "Atlantic/Canary" | "Atlantic/Faroe" | "Atlantic/Reykjavik" | "Etc/GMT" | "Europe/Dublin" | "Europe/Lisbon" | "Europe/London" | "Africa/Algiers" | "Africa/Ceuta" | "Africa/Lagos" | "Africa/Ndjamena" | "Africa/Tunis" | "Africa/Windhoek" | "Europe/Amsterdam" | "Europe/Andorra" | "Europe/Belgrade" | "Europe/Berlin" | "Europe/Brussels" | "Europe/Budapest" | "Europe/Copenhagen" | "Europe/Gibraltar" | "Europe/Luxembourg" | "Europe/Madrid" | "Europe/Malta" | "Europe/Monaco" | "Europe/Oslo" | "Europe/Paris" | "Europe/Prague" | "Europe/Rome" | "Europe/Stockholm" | "Europe/Tirane" | "Europe/Vienna" | "Europe/Warsaw" | "Europe/Zurich" | "Africa/Cairo" | "Africa/Johannesburg" | "Africa/Maputo" | "Africa/Tripoli" | "Asia/Amman" | "Asia/Beirut" | "Asia/Damascus" | "Asia/Gaza" | "Asia/Jerusalem" | "Asia/Nicosia" | "Europe/Athens" | "Europe/Bucharest" | "Europe/Chisinau" | "Europe/Helsinki" | "Europe/Istanbul" | "Europe/Kaliningrad" | "Europe/Kyiv" | "Europe/Riga" | "Europe/Sofia" | "Europe/Tallinn" | "Europe/Vilnius" | "Africa/Khartoum" | "Africa/Nairobi" | "Antarctica/Syowa" | "Asia/Baghdad" | "Asia/Qatar" | "Asia/Riyadh" | "Europe/Minsk" | "Europe/Moscow" | "Asia/Tehran" | "Asia/Baku" | "Asia/Dubai" | "Asia/Tbilisi" | "Asia/Yerevan" | "Europe/Samara" | "Indian/Mahe" | "Indian/Mauritius" | "Indian/Reunion" | "Asia/Kabul" | "Antarctica/Mawson" | "Asia/Aqtau" | "Asia/Aqtobe" | "Asia/Ashgabat" | "Asia/Dushanbe" | "Asia/Karachi" | "Asia/Tashkent" | "Asia/Yekaterinburg" | "Indian/Kerguelen" | "Indian/Maldives" | "Asia/Calcutta" | "Asia/Colombo" | "Asia/Katmandu" | "Antarctica/Vostok" | "Asia/Almaty" | "Asia/Bishkek" | "Asia/Dhaka" | "Asia/Omsk" | "Asia/Thimphu" | "Indian/Chagos" | "Asia/Rangoon" | "Indian/Cocos" | "Antarctica/Davis" | "Asia/Bangkok" | "Asia/Hovd" | "Asia/Jakarta" | "Asia/Krasnoyarsk" | "Asia/Saigon" | "Asia/Ho_Chi_Minh" | "Indian/Christmas" | "Antarctica/Casey" | "Asia/Brunei" | "Asia/Choibalsan" | "Asia/Hong_Kong" | "Asia/Irkutsk" | "Asia/Kuala_Lumpur" | "Asia/Macau" | "Asia/Makassar" | "Asia/Manila" | "Asia/Shanghai" | "Asia/Singapore" | "Asia/Taipei" | "Asia/Ulaanbaatar" | "Australia/Perth" | "Asia/Pyongyang" | "Asia/Dili" | "Asia/Jayapura" | "Asia/Seoul" | "Asia/Tokyo" | "Asia/Yakutsk" | "Pacific/Palau" | "Australia/Adelaide" | "Australia/Darwin" | "Antarctica/DumontDUrville" | "Asia/Magadan" | "Asia/Vladivostok" | "Australia/Brisbane" | "Asia/Yuzhno-Sakhalinsk" | "Australia/Hobart" | "Australia/Sydney" | "Pacific/Chuuk" | "Pacific/Guam" | "Pacific/Port_Moresby" | "Pacific/Efate" | "Pacific/Guadalcanal" | "Pacific/Kosrae" | "Pacific/Norfolk" | "Pacific/Noumea" | "Pacific/Pohnpei" | "Asia/Kamchatka" | "Pacific/Auckland" | "Pacific/Fiji" | "Pacific/Funafuti" | "Pacific/Kwajalein" | "Pacific/Majuro" | "Pacific/Nauru" | "Pacific/Tarawa" | "Pacific/Wake" | "Pacific/Wallis" | "Pacific/Apia" | "Pacific/Enderbury" | "Pacific/Fakaofo" | "Pacific/Tongatapu" | "Pacific/Kiritimati";

export interface BackupOptions {
  enabled: boolean;
  CronJobPattern: string;
  timezone: Timezones;
  folderPath: string;
}

export interface ProviderOptions {
  filePath: string;
  useExperimentalSaveMethod?: boolean;
  backupOptions?: BackupOptions;
}

export interface DatabaseMap {
  [key: string]: unknown
}

export type DatabaseSignature<V = unknown> = { [key in keyof V]: unknown };

export interface DatabaseSchema {
  type: string;
  required?: boolean
}

export type SchemaFields = Record<string, DatabaseSchema>;


declare var DatabaseTypes: {
  types: {
    quickdb: "quick.db";
    wiodb: "wio.db";
    inflamesdb: "inflames.db";
    alldb: "all.db";
    arkdb: "ark.db";
    lowdb: "lowdb";
    filesystemdb: "file-system-db";
    croxydb: "croxy.db";
    Object: "Object/Map";
    Map: "Object/Map";
    Megdb: "meg.db";
  };
};

declare module "meg.db" {

  export class BSONProvider<T extends DatabaseSignature<T> = DatabaseMap> {
    constructor(opt: ProviderOptions);

    public set<K extends keyof T>(key: K, value: T[K]): void;
    public set(key: string, value: unknown): void;
    public get<K extends keyof T>(key: K): T[K];
    public get(key: string): unknown;
    public delete<K extends keyof T>(key: K): void;
    public delete(key: string): void;
    public filter<K extends keyof T>(callback: (key: K, value: T[K]) => boolean): object;
    public filter(callback: (key: string, value: unknown) => boolean): object;
    public push<K extends keyof T>(key: K, ...values: (T[K])[]): void;
    public pull<K extends keyof T>(key: K, ...values: (T[K])[]): void;
    public deleteAll(): void;
    public all(): T;
    private read(file: string): void;
    private save(): void;
  }

  export class JSONProvider<T extends DatabaseSignature<T> = DatabaseMap> {
    constructor(opt: ProviderOptions);

    public set<K extends keyof T>(key: K, value: T[K]): void;
    public set(key: string, value: unknown): void;
    public get<K extends keyof T>(key: K): T[K];
    public get(key: string): unknown;
    public delete<K extends keyof T>(key: K): void;
    public delete(key: string): void;
    public filter<K extends keyof T>(callback: (key: K, value: T[K]) => boolean): object;
    public filter(callback: (key: string, value: unknown) => boolean): object;
    public push<K extends keyof T>(key: K, ...values: (T[K])[]): void;
    public pull<K extends keyof T>(key: K, ...values: (T[K])[]): void;
    public deleteAll(): void;
    public all(): T;
    private read(file: string): void;
    private save(): void;
  }

  export class NBTProvider<T extends DatabaseSignature<T> = DatabaseMap> {
    constructor(opt: ProviderOptions);

    public set<K extends keyof T>(key: K, value: T[K]): void;
    public set(key: string, value: unknown): void;
    public get<K extends keyof T>(key: K): T[K];
    public get(key: string): unknown;
    public delete<K extends keyof T>(key: K): void;
    public delete(key: string): void;
    public filter<K extends keyof T>(callback: (key: K, value: T[K]) => boolean): object;
    public filter(callback: (key: string, value: unknown) => boolean): object;
    public push<K extends keyof T>(key: K, ...values: (T[K])[]): void;
    public pull<K extends keyof T>(key: K, ...values: (T[K])[]): void;
    public deleteAll(): void;
    public all(): T;
    private convertToNbtFormat(data: Object): Object;
    private read(file: string): void;
    private save(): void;
  }

  export class DatabaseMigration<T extends DatabaseSignature<T> = DatabaseMap> {
    /**
    * Class of Database Migration.
    * @param {JSONProvider | BSONProvider | NBTProvider} database Meg.db Database Provider.
    */
    constructor(database: JSONProvider | BSONProvider | NBTProvider);

    /**
     * Moves Data from other databases to meg.db.
     * @param {Object} opt
     * @property {Object | Object[] | Map} data Type of data.
     * @property {"quick.db" | "wio.db" | "inflames.db" | "all.db" | "ark.db" | "lowdb" | "file-system-db" | "croxy.db" | "Object/Map"} databaseType Database types.
     * @returns {boolean} Returns true if the operation is successful.
     */
    move(opt?: { data: Object | Object[] | Map<any, any>; databaseType?: "quick.db" | "wio.db" | "inflames.db" | "all.db" | "ark.db" | "lowdb" | "file-system-db" | "croxy.db" | "Object/Map" }): boolean;
  }

  export class BSONSchema extends BSONProvider {
    constructor(filepath: string, fields: SchemaFields);

    validate(document: Record<string, any>): void;
  }

  export class JSONSchema extends JSONProvider {
    constructor(filepath: string, fields: SchemaFields);

    validate(document: Record<string, any>): void;
  }
}