import { Link } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-ink text-ink-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Briefcase className="size-5" />
            </span>
            <span className="font-display text-lg font-bold">JobConnect</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-ink-muted">
            The recruitment platform connecting ambitious candidates with teams that are hiring right now.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">For candidates</h4>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            <li>
              <Link to="/jobs" className="hover:text-ink-foreground">
                Browse jobs
              </Link>
            </li>
            <li>
              <Link to="/companies" className="hover:text-ink-foreground">
                Explore companies
              </Link>
            </li>
            <li>
              <Link to="/auth" search={{ mode: "register" }} className="hover:text-ink-foreground">
                Create an account
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">For employers</h4>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            <li>
              <Link to="/auth" search={{ mode: "register" }} className="hover:text-ink-foreground">
                Post a job
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-ink-foreground">
                How hiring works
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            <li>
              <Link to="/about" className="hover:text-ink-foreground">
                About us
              </Link>
            </li>
            <li>
              <Link to="/jobs" className="hover:text-ink-foreground">
                Latest openings
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-ink-muted">
          © {new Date().getFullYear()} JobConnect. Built as a full-stack recruitment platform.
        </p>
      </div>
    </footer>
  );
}
