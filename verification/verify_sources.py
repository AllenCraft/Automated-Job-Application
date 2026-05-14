from playwright.sync_api import sync_playwright

def run_cuj(page):
    # 1. Go to sources page
    print("Navigating to sources page...")
    page.goto("http://localhost:3000/sources")
    page.wait_for_timeout(2000)

    # 2. Add a new source
    print("Adding a new source...")
    page.fill('input[placeholder="Source Name"]', "Hacker News Jobs")
    page.fill('input[placeholder="Feed URL"]', "https://hnrss.org/jobs")
    page.click('button:has-text("Add")')
    page.wait_for_timeout(2000)

    # 3. Trigger AI discovery
    print("Triggering AI source discovery...")
    page.click('button:has-text("AI Source Discovery")')
    page.wait_for_timeout(5000)

    page.screenshot(path="/home/jules/verification/screenshots/sources_page.png")

    # 4. Toggle a source
    print("Toggling a source...")
    # Find any toggle button in the table and click it
    page.locator('tbody tr button').first.click()
    page.wait_for_timeout(2000)

    # 5. Go to dashboard and refresh jobs
    print("Refreshing jobs with new sources...")
    page.goto("http://localhost:3000/dashboard")
    page.wait_for_timeout(2000)
    page.click('button:has-text("Discover & Categorize")')
    page.wait_for_timeout(10000)

    page.screenshot(path="/home/jules/verification/screenshots/dashboard_after_new_sources.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            context.close()
            browser.close()
