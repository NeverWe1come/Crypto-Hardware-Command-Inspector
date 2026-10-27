import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { BrandLogo } from '../BrandLogo';

describe('BrandLogo', () => {
  it('renders SVG emblem with default size 28', () => {
    const { container } = render(<BrandLogo />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '28');
    expect(svg).toHaveAttribute('height', '28');
  });

  it('renders with custom size and brand text when showText is true', () => {
    const { container, getByText } = render(<BrandLogo size={48} showText={true} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '48');
    expect(getByText(/CHCI/i)).toBeInTheDocument();
    expect(getByText(/Crypto Hardware Command Inspector/i)).toBeInTheDocument();
  });
});
