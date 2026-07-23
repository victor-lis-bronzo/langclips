export type WordResult = {
	word: string;
	status: "exact" | "case" | "wrong" | "missing";
};
