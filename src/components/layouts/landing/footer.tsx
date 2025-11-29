import { Link } from "react-router";

function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <img src="/placeholder.svg?height=32&width=32" alt="Logo" />
          <p className="text-center text-sm leading-loose md:text-left">
            &copy; {new Date().getFullYear()} Company Inc. All rights reserved.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="#" className="text-sm font-medium hover:text-primary">
            Terms
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary">
            Privacy
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-primary">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
