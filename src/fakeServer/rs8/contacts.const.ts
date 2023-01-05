export type TContact = {
  name: string;
  email: string;
  title: string | null;
  role: string | null;
  phone: string | null;
};

// Image are stored at /static/PageContact/avatars/<name>.jpg
// Images are 256x256 px

// Note: Images are cached and will only be refreshed by shift-reloading.
// This will be solved once we have a new system running.

export const contacts: TContact[] = [
  {
    name: 'Lindsay Walton',
    email: 'lindsay.walton@example.com',
    title: 'Front-end Developer',
    role: 'Member',
    phone: '030-123 123',
  },
  {
    name: 'Tobias Jordans',
    email: 'tobias@fixmycity.de',
    title: null,
    role: null,
    phone: null,
  },
];
