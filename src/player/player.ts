export class Player {
    id: string;
    rating: number;
  
    constructor(data: Partial<Player>) {
      Object.assign(this, data);
    }
  }
  