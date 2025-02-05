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

  static fromJSON(data: any): Player {
    return new Player({
      id: data.id,
      rating: data.rating,
    });
  }
}
