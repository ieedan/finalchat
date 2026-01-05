<script lang="ts">
	import type { MessageWithAttachments } from '$lib/convex/chats.utils.js';
	import removeMarkdown from 'remove-markdown';

	let {
		userMessage,
		assistantMessage,
	}: {
		userMessage: MessageWithAttachments | undefined;
		assistantMessage: MessageWithAttachments | undefined;
	} = $props();

	const getUserMessageText = (message: MessageWithAttachments | undefined): string => {
		if (!message || message.role !== 'user') return '';
		return message.content || '';
	};

	const getAssistantMessageText = (message: MessageWithAttachments | undefined): string => {
		if (!message || message.role !== 'assistant') return '';
		let text = '';
		if (message.parts) {
			text = message.parts
				.filter((p) => p.type === 'text')
				.map((p) => p.text)
				.join('');
		} else {
			text = message.content || '';
		}
		return removeMarkdown(text);
	};

	const userText = getUserMessageText(userMessage);
	const assistantText = getAssistantMessageText(assistantMessage);

	const truncateText = (text: string, maxLength: number): string => {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength - 3) + '...';
	};

	const displayUserText = truncateText(userText, 200);
	const displayAssistantText = truncateText(assistantText, 400);
</script>

<div
	class="flex flex-col w-full h-full p-12 font-sans relative"
	style="background-color: #1c1c1c; color: #fafafa;"
>
	<div class="absolute top-12 left-12 flex items-center">
		<svg width="100" height="100" viewBox="0 0 464 369" style="color: #d97706;">
			<g transform="matrix(1,0,0,1,-744.674384,-723.689943)">
				<g transform="matrix(0.990844,-0.130447,0.140819,1.069625,308.164017,323.729868)">
					<path
						d="M770.129,607.794C774.18,607.794 777.966,609.661 780.228,612.775C782.489,615.89 782.93,619.842 781.402,623.319C773.191,642.009 760.491,670.918 760.491,670.918C756.73,679.479 747.954,685.245 737.989,685.703L537.829,694.901C534.462,695.055 531.226,696.158 528.553,698.062L456.554,749.342C453.254,751.693 449.308,753.138 445.164,753.514L356.235,761.579C348.198,762.308 340.518,758.334 336.973,751.613C333.428,744.891 334.764,736.837 340.324,731.412L379.001,693.674C380.018,692.681 380.936,691.605 381.744,690.459L527.505,483.649C531.748,477.629 538.985,474 546.747,474L819.359,474C825.548,474 831.332,476.853 834.787,481.611C838.241,486.368 838.914,492.406 836.581,497.717C836.581,497.717 825.908,522.01 819.369,536.897C816.363,543.739 809.183,548.213 801.209,548.213C761.203,548.213 643.945,548.213 643.945,548.213C640.897,548.213 638.014,549.495 636.108,551.697L593.802,600.589C592.651,601.919 592.425,603.743 593.222,605.279C594.018,606.816 595.695,607.794 597.535,607.794L770.129,607.794Z"
						fill="currentColor"
					/>
				</g>
			</g>
		</svg>
	</div>

	<div class="flex flex-col flex-1 justify-center" style="gap: 1.5rem;">
		{#if userMessage && displayUserText}
			<div class="flex flex-col items-end w-full">
				<p
					class="p-5 max-w-[85%] text-xl"
					style="background-color: #3a3a3a; color: #fafafa; border-radius: 12px;"
				>
					{displayUserText}
				</p>
			</div>
		{/if}

		{#if assistantMessage && displayAssistantText}
			<div class="flex flex-col items-start w-full">
				<p
					class="p-5 max-w-[85%] text-xl"
					style="background-color: #1c1c1c; color: #fafafa; border-radius: 12px; border: 1px solid #3a3a3a;"
				>
					{displayAssistantText}
				</p>
			</div>
		{/if}
	</div>

	<p class="absolute bottom-12 right-12 text-2xl" style="color: #fafafa;">
		Check out the full chat on finalchat.app!
	</p>
</div>
