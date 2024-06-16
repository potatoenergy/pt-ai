export async function AutoPlay(page: any) {
  const playButtonSelector =
    'button[aria-haspopup="true"][dropdowntoggle][class="btn btn-lg btn-success text-truncate flex-grow-1"]';
  await page.waitForSelector(playButtonSelector, { visible: true });
  await page.click(playButtonSelector);
}
