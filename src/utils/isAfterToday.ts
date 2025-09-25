/* 発売日が今日より未来か
-------------------------------------------- */
export function isAfterToday(releaseDate :string) {
  return new Date(releaseDate) > new Date();
}
