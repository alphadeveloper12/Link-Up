import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const SolutionsDropdown: React.FC = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
        Solutions
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem asChild>
          <a href="#features" className="w-full cursor-pointer">
            Features
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/analytics" className="w-full cursor-pointer">
            Analytics
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/training" className="w-full cursor-pointer">
            Training
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/support" className="w-full cursor-pointer">
            Support
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="#testimonials" className="w-full cursor-pointer">
            Testimonials
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};