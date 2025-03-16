
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Github,
  Heart 
} from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/50 py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-4 mb-6 md:mb-0">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                ConferenceHub
              </span>
            </Link>
            <p className="text-muted-foreground max-w-xs">
              The ultimate conference management solution for seamless events and engaged attendees.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="#" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </SocialLink>
              <SocialLink href="#" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </SocialLink>
              <SocialLink href="#" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </SocialLink>
              <SocialLink href="#" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </SocialLink>
              <SocialLink href="#" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </SocialLink>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
            <FooterSection title="Product">
              <FooterLink href="/#features">Features</FooterLink>
              <FooterLink href="/#pricing">Pricing</FooterLink>
              <FooterLink href="/dashboard">Dashboard</FooterLink>
              <FooterLink href="/#testimonials">Testimonials</FooterLink>
            </FooterSection>
            <FooterSection title="Company">
              <FooterLink href="/#about">About</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
            </FooterSection>
            <FooterSection title="Legal">
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/cookies">Cookie Policy</FooterLink>
            </FooterSection>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ConferenceHub. All rights reserved.</p>
          <p className="flex items-center">
            Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> for conference organizers
          </p>
        </div>
      </div>
    </footer>
  );
}

interface SocialLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

function SocialLink({ className, children, ...props }: SocialLinkProps) {
  return (
    <a
      className={cn(
        "rounded-full bg-secondary p-2 text-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-ring",
        className
      )}
      target="_blank"
      rel="noreferrer"
      {...props}
    >
      {children}
    </a>
  );
}

interface FooterSectionProps {
  title: string;
  children: React.ReactNode;
}

function FooterSection({ title, children }: FooterSectionProps) {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-foreground">{title}</h4>
      <ul className="space-y-2">
        {children}
      </ul>
    </div>
  );
}

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <li>
      <Link
        to={href}
        className="text-muted-foreground transition-colors hover:text-primary focus-ring inline-block"
      >
        {children}
      </Link>
    </li>
  );
}
