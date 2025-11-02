import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto w-full py-6 md:py-8 border-t-2 border-border/80">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
        <p className="text-xs md:text-sm text-muted-foreground font-sans tracking-wide">
          Crafted by <span className="font-semibold text-foreground">Antonina Sukhanova</span> &nbsp;and&nbsp; <span className="font-semibold text-foreground">Alexander Babarika</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;


