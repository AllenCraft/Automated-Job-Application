from playwright.sync_api import sync_playwright

def run_cuj(page):
    # 1. Set up profile
    print("Setting up profile...")
    page.goto("http://localhost:3000/profile")
    page.wait_for_timeout(1000)
    page.fill('textarea[placeholder*="resume"]', "Senior Software Engineer with expertise in TypeScript, React, Next.js, and Node.js. 10 years experience.")
    page.wait_for_timeout(500)
    page.select_option('select', label='Senior')
    page.wait_for_timeout(500)
    page.fill('input[placeholder="e.g. 120,000"]', "180000")
    page.wait_for_timeout(500)
    page.click('button:has-text("Save Profile")')
    page.wait_for_timeout(2000)

    # 2. Go to dashboard and discover
    print("Navigating to dashboard and discovering...")
    page.goto("http://localhost:3000/dashboard")
    page.wait_for_timeout(1000)

    # Check if we already have jobs, if not discover
    if page.get_by_text("Apply (Dry Run)").count() == 0:
        print("Discovering jobs...")
        page.click('button:has-text("Discover & Categorize")')
        page.wait_for_timeout(15000) # Wait for AI scoring

    page.screenshot(path="/home/jules/verification/screenshots/dashboard_populated.png")
    page.wait_for_timeout(1000)

    # 3. Simulate an application
    print("Simulating application...")
    # Find an "Apply (Dry Run)" button and click it
    apply_buttons = page.get_by_role("button", name="Apply (Dry Run)")
    if apply_buttons.count() > 0:
        apply_buttons.first.click()
        page.wait_for_timeout(3000) # Wait for simulation

        # Take screenshot of the success alert/state if possible
        page.screenshot(path="/home/jules/verification/screenshots/application_simulated.png")
    else:
        print("No apply buttons found.")

    page.wait_for_timeout(1000)

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
