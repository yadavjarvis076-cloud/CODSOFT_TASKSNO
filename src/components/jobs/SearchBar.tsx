import { useState, type FormEvent } from "react";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar({
  initialKeyword = "",
  initialLocation = "",
  onSearch,
  size = "lg",
}: {
  initialKeyword?: string;
  initialLocation?: string;
  onSearch: (keyword: string, location: string) => void;
  size?: "lg" | "sm";
}) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState(initialLocation);

  function submit(event: FormEvent) {
    event.preventDefault();
    onSearch(keyword.trim(), location.trim());
  }

  const pad = size === "lg" ? "p-2" : "p-1.5";

  return (
    <form
      onSubmit={submit}
      className={`flex w-full flex-col gap-2 rounded-2xl border bg-card ${pad} shadow-card sm:flex-row sm:items-center`}
    >
      <div className="flex flex-1 items-center gap-2 px-3">
        <Search className="size-5 shrink-0 text-muted-foreground" />
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Job title, skill or keyword"
          aria-label="Job title, skill or keyword"
          className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>
      <div className="hidden w-px self-stretch bg-border sm:block" />
      <div className="flex flex-1 items-center gap-2 px-3">
        <MapPin className="size-5 shrink-0 text-muted-foreground" />
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City or remote"
          aria-label="Location"
          className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>
      <Button type="submit" size={size === "lg" ? "lg" : "default"} className="sm:w-auto">
        Search jobs
      </Button>
    </form>
  );
}
