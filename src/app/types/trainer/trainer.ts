export type Account = {
  photoData: string;
  photoName: string;
  fullName: string;
  isAdult: boolean;
  hobby?: string;
  birthdate: Date;
  dni: string;
};

export interface PersistedTrainer {
  profile: Account | null;
  teamIds: number[];
}
