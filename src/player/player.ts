export class Player {
  id: string;
  rating: number;

  constructor(data: Partial<Player>) {
    Object.assign(this, data);
  }

  toJSON() {
    return {
      id: this.id,
      rating: this.rating,
    };
  }
}
