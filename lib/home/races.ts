// The homepage's race demos: in each tool section, "by hand" plays against "just ask" while the section is on screen.
// startRaces() runs when the homepage mounts (lib/home/attach.ts); the function it returns stops every race and
// removes every listener it added.
import { listener } from "./listen";

type RaceView = { chip?: string; head: [string, string]; rows: [string, string][] };
type RaceStep = [nav: number, crumb: string, caption: string, view: string | null, mode?: string];
type Race = { name: string; views: Record<string, RaceView>; steps: RaceStep[]; prompt: string; work: string[]; done: string };

const RACES: Record<string, Race> = {"shopify":{"name":"Shopify","views":{"rep":{"head":["Reports",""],"rows":[["Sales over time",""],["Sales by product",""],["Sessions by location",""],["Returning customers",""]]},"s0":{"chip":"Date: today","head":["Product","Units sold"],"rows":[["Partridgeberry jam","3"],["Wool mitts","1"],["Sea salt caramels","2"],["Molasses cookies","0"]]},"s1":{"chip":"Date: last month","head":["Product","Units sold"],"rows":[["Partridgeberry jam","187"],["Wool mitts","150"],["Sea salt caramels","212"],["Molasses cookies","96"]]},"s2":{"chip":"Date: last month","head":["Product","Units sold ↓"],"rows":[["Sea salt caramels","212"],["Partridgeberry jam","187"],["Wool mitts","150"],["Molasses cookies","96"]]},"inv":{"head":["Product","In stock"],"rows":[["Molasses cookies","60"],["Partridgeberry jam","120"],["Sea salt caramels","14"],["Wool mitts","9"]]}},"steps":[[3,"Analytics","Open Analytics",null],[3,"Analytics › Reports","Open Reports","rep"],[3,"Reports › Sales by product","Find Sales by product","s0"],[3,"Reports › Sales by product","Set the date range to last month","s1"],[3,"Reports › Sales by product","Sort by units sold","s2"],[2,"Products › Inventory","Now open Inventory, a separate screen","inv"],[2,"Products › Inventory","Check the stock on each product, one at a time","inv","scan"]],"prompt":"Pull last month's top 10 sellers by units sold, show current stock for each, and tell me which will run out in 30 days","work":["Reading last month's sales in Shopify","Checking the stock on each one"],"done":"You decide what to reorder."},"meta":{"name":"Meta Ads","views":{"c0":{"chip":"Date: today","head":["Campaign","Cost per result"],"rows":[["Fall sale","$4.30"],["New arrivals","$7.00"],["Local awareness","$9.10"],["Email sign-ups","$3.10"]]},"c7":{"chip":"Date: last 7 days","head":["Campaign","Cost per result"],"rows":[["Fall sale","$4.10"],["New arrivals","$6.80"],["Local awareness","$9.40"],["Email sign-ups","$3.20"]]},"p7":{"chip":"Date: the 7 days before","head":["Campaign","Cost per result"],"rows":[["Fall sale","$4.60"],["New arrivals","$6.10"],["Local awareness","$5.90"],["Email sign-ups","$3.40"]]}},"steps":[[0,"Ads Manager","Log into Ads Manager","c0"],[0,"Ads Manager › Campaigns","Set the date range to the last 7 days","c7"],[0,"Ads Manager › Campaigns","Read the spend and the cost per result","c7"],[0,"Ads Manager › Campaigns","Switch to the 7 days before","p7"],[0,"Ads Manager › Campaigns","Compare every campaign by eye, back and forth","c7","scan"]],"prompt":"Pull spend, cost per result, and ROAS for all active campaigns over the last 7 days vs. the 7 days before. Tell me which ad sets are underperforming and recommend which to pause.","work":["Reading the last 14 days in Meta Ads","Comparing this week with the one before"],"done":"You make the call to pause."},"quickbooks":{"name":"QuickBooks","views":{"rep":{"head":["Reports",""],"rows":[["Profit and loss",""],["Who owes you",""],["Balance sheet",""],["Sales by customer",""]]},"ar":{"head":["Customer","Overdue by"],"rows":[["Harbour Dental","12 days"],["Hillside Roofing","64 days"],["East End Yoga","31 days"],["Cove Road Cafe","4 days"]]},"inv":{"head":["New invoice",""],"rows":[["Customer","Harbour Dental"],["Item","Website maintenance retainer"],["Amount","$450"],["Due","In 15 days"]]}},"steps":[[3,"Reports","Open Reports","rep"],[3,"Reports › Who owes you","Open the report of who owes you","ar"],[3,"Reports › Who owes you","Read down the list and decide who to chase","ar"],[1,"Sales › New invoice","Now open a new invoice, a separate screen","inv"],[1,"Sales › New invoice","Fill in the customer, the item, the amount and the date","inv","scan"]],"prompt":"Show me who owes us, flag anyone over 60 days, and send Harbour Dental an invoice for the retainer","work":["Reading who owes you in QuickBooks","Preparing the invoice"],"done":"You check it, then it goes."},"gmail":{"name":"Gmail and Calendar","views":{"inb":{"chip":"29 unread","head":["From","Subject"],"rows":[["Hillside Roofing","Quote for the deck?"],["Weekly deals","Fall offers inside"],["Harbour Dental","Can we move Thursday?"],["Your supplier","Invoice attached"]]},"one":{"head":["Hillside Roofing",""],"rows":[["Subject","Quote for the deck?"],["Asks for","A price by Friday"],["Reply today?","Yes"],["Next","28 more to read"]]}},"steps":[[0,"Inbox","Open the inbox","inb"],[0,"Inbox › Hillside Roofing","Open the first email and read it","one"],[0,"Inbox › Hillside Roofing","Decide: reply today, later, or junk","one"],[0,"Inbox","Back to the inbox. Then the next one, and the next.","inb","scan"]],"prompt":"Group today's inbox into needs a reply today, can wait, and junk. Then find 30 minutes next week with Harbour Dental and send the invite.","work":["Reading today's inbox in Gmail","Checking both calendars"],"done":"Nothing sends without your OK."},"microsoftexcel":{"name":"Excel","views":{"sh":{"chip":"Sales.xlsx","head":["Category","Revenue"],"rows":[["Bread","$4,210"],["Pastry","$3,180"],["Coffee","$2,640"],["Catering","$1,900"]]},"pv":{"chip":"PivotTable fields","head":["Field","Set to"],"rows":[["Rows","Category"],["Columns","Month"],["Values","Sum of revenue"],["Chart","Not added yet"]]}},"steps":[[0,"Sales.xlsx","Open the sales workbook","sh"],[0,"Sales.xlsx","Select all of the sales data","sh"],[1,"Insert › PivotTable","Insert a pivot table","pv"],[1,"Insert › PivotTable","Set up each field, then build the chart","pv","scan"]],"prompt":"Add a pivot table of revenue by category this month vs. last, with a bar chart","work":["Reading the open workbook in Excel","Adding the table and the chart"],"done":"The live workbook is updated."},"hubspot":{"name":"HubSpot","views":{"all":{"head":["Deal","Last activity"],"rows":[["Hillside Roofing","3 days ago"],["Cove Road Cafe","21 days ago"],["East End Yoga","17 days ago"],["Harbour Dental","30 days ago"]]},"st":{"chip":"Last activity: over 14 days ago","head":["Deal","Last activity ↓"],"rows":[["Harbour Dental","30 days ago"],["Cove Road Cafe","21 days ago"],["East End Yoga","17 days ago"]]},"em":{"head":["New email",""],"rows":[["To","Harbour Dental"],["Subject","Following up"],["Message","Still typing…"]]}},"steps":[[1,"Deals","Open the deals list","all"],[1,"Deals","Filter by last activity date, then sort","st"],[1,"Deals › Harbour Dental","Open the first stalled deal and reread it","st"],[1,"Deals › New email","Write a follow-up by hand","em"],[1,"Deals","Back to the list. Next deal, same again.","st","scan"]],"prompt":"Show every deal with no activity in 14 days and draft a follow-up for each","work":["Finding the quiet deals in HubSpot","Drafting a follow-up for each"],"done":"You read each one and press send."}};
const fmt = (ms: number) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const row = (r: string[], c?: string) => `<div class="scr-row${c || ''}"><span>${r[0]}</span><span>${r[1]}</span></div>`;

/** Starts the race demos. The returned function stops them all and removes their listeners. */
export function startRaces(): () => void {
  const l = listener();
  const all = [...document.querySelectorAll<HTMLElement>('[data-race]')].map(sec => {
    const R = RACES[sec.dataset.race!], hand = sec.querySelector<HTMLElement>('.lane.hand')!, ask = sec.querySelector<HTMLElement>('.lane.ask')!;
    const scr = hand.querySelector<HTMLElement>('.scr')!, nav = [...hand.querySelectorAll<HTMLElement>('.scr-nav li')], crumb = hand.querySelector<HTMLElement>('.crumb')!, view = hand.querySelector<HTMLElement>('.scr-view')!, cur = hand.querySelector<HTMLElement>('.scr-cur')!, hs = hand.querySelector<HTMLElement>('.lane-s')!;
    const me = ask.querySelector<HTMLElement>('.rmsg.me span')!, st = ask.querySelector<HTMLElement>('.rmsg.st')!, ai = ask.querySelector<HTMLElement>('.rmsg.ai')!, as = ask.querySelector<HTMLElement>('.lane-s')!;
    const swH = hand.querySelector<HTMLElement>('.sw')!, swA = ask.querySelector<HTMLElement>('.sw')!;
    let run = 0, on = false, t0 = 0, tStop = 0, timer: ReturnType<typeof setInterval> | 0 = 0;
    const wait = (ms: number, id: number) => new Promise<void>((ok, no) => setTimeout(() => id === run ? ok() : no(), ms));
    const draw = (k: string) => { const v = R.views[k]; view.innerHTML = (v.chip ? `<p class="scr-chip">${v.chip}</p>` : '') + row(v.head, ' hd') + v.rows.map(r => row(r)).join(''); };
    const menu = (n: number) => nav.forEach((li, k) => li.classList.toggle('on', k === n));
    const point = (t: Element | null | undefined) => { if (!t) return; const a = scr.getBoundingClientRect(), b = t.getBoundingClientRect(); if (!b.width) return;
      const x = t.matches('li') ? b.width / 2 : t.matches('.scr-chip') ? b.width + 12 : t.firstElementChild!.getBoundingClientRect().width + 26;
      cur.style.transform = `translate(${(b.left - a.left + x).toFixed(1)}px, ${(b.top - a.top + b.height / 2 + (t.matches('li') ? 17 : 0)).toFixed(1)}px)`; };
    const clocks = () => { const now = performance.now(); swH.textContent = fmt(now - t0); swA.textContent = fmt((tStop || now) - t0); };
    function reset() {
      hand.classList.remove('go'); ask.classList.remove('go', 'sent', 'done'); menu(-1); crumb.textContent = R.name; view.innerHTML = ''; hs.textContent = ''; as.textContent = '';
      me.textContent = ''; st.hidden = ai.hidden = true; swH.textContent = swA.textContent = '0:00'; cur.style.transform = '';
    }
    async function byHand(id: number) {
      let n0 = -1, v0: string | null = null;
      for (let i = 0; i < R.steps.length; i++) {
        const [n, c, cap, v, mode] = R.steps[i];
        hs.innerHTML = `<b>Step ${i + 1}</b><span>${cap}</span>`;
        if (n !== n0) { point(nav[n]); await wait(900, id); menu(n); n0 = n; }
        crumb.textContent = c;
        if (v && v !== v0) { view.classList.add('load'); await wait(700, id); draw(v); view.classList.remove('load'); v0 = v; }
        point(view.querySelector('.scr-chip') || view.querySelector('.scr-row:not(.hd)'));
        await wait(1700, id);
        // The last step is the slow one: every row, one at a time, for as long as you watch.
        if (mode === 'scan') for (;;) { const rows = [...view.querySelectorAll('.scr-row:not(.hd)')];
          for (const r of rows) { point(r); rows.forEach(x => x.classList.toggle('on', x === r)); await wait(1900, id); }
          hs.innerHTML = `<b>Still going</b><span>${cap}</span>`; }
      }
    }
    async function justAsk(id: number) {
      as.innerHTML = '<b>Typing</b><span>Plain words, nothing to learn</span>';
      for (let i = 1; i <= R.prompt.length; i++) { me.textContent = R.prompt.slice(0, i); await wait(62, id); }
      ask.classList.add('sent'); st.hidden = false; as.innerHTML = `<b>Working</b><span>The AI does it in ${R.name}</span>`;
      for (const w of R.work) { st.textContent = w + '…'; await wait(2300, id); }
      st.hidden = true; ai.hidden = false; tStop = performance.now(); ask.classList.add('done'); as.innerHTML = `<b>Done</b><span>${R.done}</span>`; clocks();
    }
    function start() { const id = ++run; reset(); t0 = performance.now(); tStop = 0; hand.classList.add('go'); ask.classList.add('go');
      timer = setInterval(clocks, 250); byHand(id).catch(() => {}); justAsk(id).catch(() => {}); }
    function stop() { run++; clearInterval(timer); reset(); }
    return {
      check(vh: number) { const r = sec.getBoundingClientRect(), now = r.top < vh * 0.3 && r.bottom > vh * 0.75;
        if (now === on) return; on = now; now ? start() : stop(); },
      // Leaving the page: a race that is running stops, and its pending steps are dropped.
      halt() { if (on) { on = false; stop(); } },
    };
  });
  let queued = false, raf = 0;
  const check = () => { queued = false; all.forEach(a => a.check(innerHeight)); };
  const askCheck = () => { if (!queued) { queued = true; raf = requestAnimationFrame(check); } };
  l.on(window, 'scroll', askCheck, { passive: true });
  l.on(window, 'resize', askCheck);
  askCheck();
  return () => {
    cancelAnimationFrame(raf);
    queued = false;
    all.forEach(a => a.halt());
    l.stop();
  };
}
