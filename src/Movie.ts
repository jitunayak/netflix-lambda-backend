export interface Movie {
  description: string;
  genre: string;
  title: string;
  thumbnail: string;
  movieId: string;
  rating: number;
}

export enum genres {
  Action,
  Comedy,
  Horror,
  Drama,
  SciFi,
  Thriller,
  Fantasy,
  Romance,
  Documentary,
  Animation,
  Adventure,
  Family,
  Biography,
  History,
  War,
  Music,
  Musical,
  Sport,
  Short,
  Other,
}
