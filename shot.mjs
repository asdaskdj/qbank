import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const p = await b.newPage({ viewport: { width: 1600, height: 950 } })
const S = '/tmp/claude-0/-home-claude/b68b5e18-d110-536e-8e05-b3ce2a11741e/scratchpad'
p.setDefaultTimeout(8000)
await p.goto('http://localhost:4174/login', { waitUntil: 'networkidle' })
await p.screenshot({ path: `${S}/q-login.png` })
await p.fill('input[type=email]', 'demo@beautifulmath.kr')
await p.fill('input[type=password]', 'x')
await p.click('button[type=submit]')
await p.waitForTimeout(700)
await p.screenshot({ path: `${S}/q-step1.png` })
// open first unit and select all via its checkbox
const firstUnitCb = p.locator('input[type=checkbox]').first()
await firstUnitCb.click()
// also expand
await p.locator('svg.lucide-chevron-right').first().click().catch(() => {})
await p.waitForTimeout(400)
await p.screenshot({ path: `${S}/q-step1-sel.png` })
// next
await p.click('text=다음 단계 →')
await p.waitForTimeout(900)
await p.screenshot({ path: `${S}/q-step2.png` })
await p.click('text=다음 단계 →')
await p.waitForTimeout(300)
// fill title
await p.fill('input[placeholder*="황금중"]', '황금중 2학년 2학기 중간고사 대비')
await p.fill('input[placeholder*="이인제T"]', '이인제T')
await p.waitForTimeout(1200)
await p.screenshot({ path: `${S}/q-step3.png` })
await p.click('text=학습지 만들기 (인쇄 · PDF)')
await p.waitForTimeout(1500)
await p.screenshot({ path: `${S}/q-print.png`, fullPage: false })
// naesin
await p.goto('http://localhost:4174/naesin', { waitUntil: 'networkidle' })
await p.waitForTimeout(400)
await p.screenshot({ path: `${S}/q-naesin.png` })
// problems json tab
await p.goto('http://localhost:4174/problems', { waitUntil: 'networkidle' })
await p.click('text=JSON 대량 등록')
await p.waitForTimeout(300)
await p.screenshot({ path: `${S}/q-problems.png` })
await b.close()
console.log('DONE')
