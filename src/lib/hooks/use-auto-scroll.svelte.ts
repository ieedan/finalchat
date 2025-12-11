/*
	Installed from @ieedan/shadcn-svelte-extras
*/

type Options = {
	startAtBottom?: boolean;
};

/** Use this on a vertically scrollable container to ensure that it automatically scrolls to the bottom of the content.
 *
 * ## Usage
 * ```svelte
 * <script lang="ts">
 *      import { UseAutoScroll } from '$lib/hooks/use-auto-scroll.svelte';
 *
 *      let { children } = $props();
 *
 *      const autoScroll = new UseAutoScroll();
 * </script>
 *
 * <div>
 *      <div bind:this={autoScroll.ref}>
 *          {@render children?.()}
 *      </div>
 *      {#if !autoScroll.isAtBottom}
 *          <button onclick={() => autoScroll.scrollToBottom()}>
 *              Scroll To Bottom
 *          </button>
 *      {/if}
 * </div>
 * ```
 */
export class UseAutoScroll {
	#ref = $state<HTMLElement>();
	#scrollY: number = $state(0);
	#userHasScrolled = $state(false);
	private lastScrollHeight = 0;
	isAutoScrolling = $state(false);

	constructor(readonly opts: Options = { startAtBottom: true }) {}

	// This sets everything up once #ref is bound
	set ref(ref: HTMLElement | undefined) {
		this.#ref = ref;

		if (!this.#ref) return;

		this.lastScrollHeight = this.#ref.scrollHeight;

		if (this.opts.startAtBottom) {
			// start from bottom or start position
			this.#ref.scrollTo(0, this.#scrollY ? this.#scrollY : this.#ref.scrollHeight);
		}

		this.#ref.addEventListener('scroll', () => {
			if (!this.#ref) return;

			this.#scrollY = this.#ref.scrollTop;

			if (!this.isAutoScrolling) this.disableAutoScroll();

			if (this.isAutoScrolling && this.isAtBottom) {
				this.isAutoScrolling = false;
			}
		});

		window.addEventListener('resize', () => {
			this.scrollToBottom(true);
		});

		// should detect when something changed that effected the scroll height
		const observer = new MutationObserver(() => {
			if (!this.#ref) return;

			if (this.#ref.scrollHeight !== this.lastScrollHeight) {
				this.scrollToBottom(true);
			}

			this.lastScrollHeight = this.#ref.scrollHeight;
		});

		observer.observe(this.#ref, { childList: true, subtree: true });

		this.scrollToBottom = this.scrollToBottom.bind(this);
	}

	get ref() {
		return this.#ref;
	}

	get scrollY() {
		return this.#scrollY;
	}

	get isNearBottom() {
		if (!this.#ref) return true;

		return this.#scrollY + this.#ref.offsetHeight + 50 >= this.#ref.scrollHeight;
	}

	/** Checks if the container is scrolled to the bottom */
	get isAtBottom() {
		if (!this.#ref) return true;

		return this.#scrollY + this.#ref.offsetHeight >= this.#ref.scrollHeight;
	}

	/** Checks if the container is scrolled to the top */
	get isAtTop() {
		if (!this.#ref) return true;

		return this.#scrollY === 0;
	}

	get isScrollable() {
		if (!this.#ref) return false;

		return this.lastScrollHeight > this.#ref.offsetHeight;
	}

	/** Disables auto scrolling until the container is scrolled back to the bottom */
	disableAutoScroll() {
		this.#userHasScrolled = !this.isNearBottom;
	}

	/** Scrolls the container to the bottom */
	scrollToBottom(auto = false, behavior: 'smooth' | 'auto' | 'instant' = 'smooth') {
		if (!this.#ref) return;

		this.isAutoScrolling = auto;

		// don't auto scroll if user has scrolled
		if (auto && this.#userHasScrolled) return;

		this.#ref.scrollTo({
			left: 0,
			top: this.#ref.scrollHeight,
			behavior
		});
	}
}
