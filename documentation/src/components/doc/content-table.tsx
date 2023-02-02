import type { CollectionQuery } from "@db/types";
import type { Q } from "@lib/db";
import { isMenuOpen } from "@lib/state";
import { dynamicClassName } from "@lib/styles";
import { Show, createSignal, mergeProps } from "solid-js";

export default (props: {
	collections: CollectionQuery<Q["main" | "integration"]["*"]>[];
	initialCollectionId?: string;
	currentPath?: string;
	title?: string;
}) => {
	const mergedProps = mergeProps(
		{
			initialCollectionId: props.collections[0]._id,
			currentPath: "/",
			title: null
		},
		props
	);
	const { collections, title, currentPath } = mergedProps;
	const [selectedCollectionId, setSelectedCollectionId] = createSignal(
		mergedProps.initialCollectionId as string
	);
	const CollectionLink = (props: {
		collection: (typeof collections)[number];
	}) => (
		<Show when={props.collection._id === selectedCollectionId()}>
			<For each={props.collection._collections}>
				{(section) => (
					<div class="mb-10">
						<p class="font-medium">{section.title}</p>
						<ul class="list-none mt-2 text-gray-500 dark:text-zinc-400">
							<For each={section._documents}>
								{(page) => {
									const urlPathname = `/${page._path
										.split("/")
										.slice(1)
										.join("/")}`;
									const isSelected = currentPath.startsWith(urlPathname);
									const href =
										page._baseCollectionId === "main"
											? page.redirect ?? urlPathname
											: urlPathname;
									const target = "redirect" in page ? "_blank" : "";
									return (
										<li
											class={dynamicClassName("my-1 pl-4 border-l-2", {
												"text-main border-main": isSelected,
												"border-zinc-400 hover:border-black dark:hover:border-zinc-200 hover:text-black dark:hover:text-zinc-200":
													!isSelected
											})}
										>
											<a href={href} target={target}>
												{page.title}
											</a>
										</li>
									);
								}}
							</For>
						</ul>
					</div>
				)}
			</For>
		</Show>
	);
	return (
		<div
			class={dynamicClassName(
				"border-r dark:border-zinc-800 shrink-0 pt-20 fixed z-40 w-full sm:w-72 pr-4 h-screen bg-white dark:bg-black-zinc xl:block",
				{
					hidden: !isMenuOpen()
				}
			)}
		>
			<Show when={!!title}>
				<h3 class="text-lg font-medium">{title}</h3>
			</Show>
			<Show when={collections.length > 1}>
				<div class="grid grid-cols-2 gap-x-2 sticky top-0 w-full bg-white dark:bg-black-zinc">
					<For each={collections}>
						{(content) => {
							return (
								<div
									class={dynamicClassName("w-full pb-1 border-b-2", {
										"border-main": content._id === selectedCollectionId()
									})}
								>
									<button
										class="w-full mx-auto block text-center hover:bg-gray-100 dark:hover:bg-zinc-900 rounded py-1"
										onClick={() => setSelectedCollectionId(content._id)}
									>
										{content.title}
									</button>
								</div>
							);
						}}
					</For>
				</div>
			</Show>
			<div class="overflow-auto h-full relative overscroll-contain pb-8 pt-4">
				<For each={collections}>
					{(collection) => <CollectionLink collection={collection} />}
				</For>
			</div>
		</div>
	);
};

// Custom <For/> implementation for types
const For = <T extends any[]>(props: {
	each: T;
	children: (item: T[number], index: () => number) => any;
}) => {
	return <>{props.each.map((val, i) => props.children(val, () => i))}</>;
};