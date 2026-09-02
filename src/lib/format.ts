export const formatToman = (value: number) => new Intl.NumberFormat("fa-IR").format(value);

export const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" }).format(value);
