export class User {
  uid: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
  username: string;
  email: string;
  point: number;

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }

  toJSON() {
    return {
      uid: this.uid,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLogin: this.lastLogin,
      username: this.username,
      email: this.email,
      point: this.point,
    };
  }

  static fromJSON(data: any): User {
    return new User({
      uid: data.uid,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastLogin: data.lastLogin,
      username: data.username,
      email: data.email,
      point: data.point,
    });
  }
}
