import { Injectable, NgZone } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export interface AnimationCleanup { destroy(): void; }

@Injectable({ providedIn: 'root' })
export class AnimationService {
  private registered = false;

  constructor(private readonly zone: NgZone) {}

  initHome(root: HTMLElement): AnimationCleanup {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      root.querySelectorAll<HTMLElement>('.reveal-up, .reveal-lines').forEach(node => {
        node.style.opacity = '1'; node.style.transform = 'none';
      });
      return { destroy: () => undefined };
    }

    this.register();
    const listeners: Array<() => void> = [];
    let context: gsap.Context | undefined;
    let media: gsap.MatchMedia | undefined;

    this.zone.runOutsideAngular(() => {
      context = gsap.context(() => {
        gsap.set('.hero-title', { perspective: 900 });
        gsap.timeline({ defaults: { ease: 'power4.out' } })
          .from('.hero-kicker', { y: 24, opacity: 0, duration: .65 })
          .from('.title-line', { yPercent: 115, opacity: 0, rotateX: 8, transformOrigin: '50% 100%', duration: 1.05, stagger: .14 }, '-=.35')
          .from('.hero-lead', { y: 32, opacity: 0, duration: .72 }, '-=.58')
          .from('.hero-actions > *', { y: 24, opacity: 0, duration: .55, stagger: .12 }, '-=.42')
          .from('.proof-item', { y: 18, opacity: 0, duration: .5, stagger: .1 }, '-=.28')
          .from('.hero-media', { clipPath: 'inset(100% 0 0 0 round 220px 220px 30px 30px)', rotate: -5, scale: .96, duration: 1.25 }, '-=1.15')
          .from('.stage-card', { x: 70, opacity: 0, duration: .75 }, '-=.52')
          .from('.media-stamp', { scale: 0, rotate: -80, duration: .7, ease: 'back.out(1.55)' }, '-=.55');

        gsap.to('.media-sheen', { x: '430%', duration: 2.4, ease: 'power2.inOut', repeat: -1, repeatDelay: 2.8 });
        gsap.to('.media-stamp', { rotate: 3, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
        gsap.to('.status-dot', { boxShadow: '0 0 0 14px rgba(217,255,67,0)', duration: 1.35, repeat: -1, ease: 'power1.out' });

        gsap.to('.hero-media img', {
          yPercent: 10, scale: 1.09, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
        });

        gsap.utils.toArray<HTMLElement>('.reveal-up').forEach((element, index) => {
          gsap.fromTo(element, { y: 44, opacity: 0 }, {
            y: 0, opacity: 1, duration: .82, delay: (index % 3) * .04, ease: 'power4.out',
            scrollTrigger: { trigger: element, start: 'top 88%', once: true },
          });
        });
        gsap.utils.toArray<HTMLElement>('.reveal-lines').forEach(element => {
          gsap.fromTo(element, { y: 38, opacity: 0 }, {
            y: 0, opacity: 1, duration: .95, ease: 'power4.out',
            scrollTrigger: { trigger: element, start: 'top 86%', once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>('.bento-card, .package-card').forEach(card => {
          gsap.from(card, {
            y: 55, opacity: 0, rotateX: 4, duration: .8, ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 90%', once: true },
          });
        });

        gsap.to('.cta-orbit--one', { rotate: 38, scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.final-cta', start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.to('.cta-orbit--two', { rotate: -42, x: 100, ease: 'none', scrollTrigger: { trigger: '.final-cta', start: 'top bottom', end: 'bottom top', scrub: true } });

        root.querySelectorAll<HTMLElement>('[data-counter]').forEach(node => {
          const target = Number(node.dataset['counter'] ?? 0);
          const state = { value: 0 };
          gsap.to(state, {
            value: target, duration: 1.7, ease: 'power3.out',
            scrollTrigger: { trigger: node, start: 'top 88%', once: true },
            onUpdate: () => { node.textContent = Number.isInteger(target) ? Math.round(state.value).toLocaleString('en-IN') : state.value.toFixed(1); },
          });
        });

        media = gsap.matchMedia();
        media.add('(min-width: 768px)', () => {
          const track = root.querySelector<HTMLElement>('.process-track');
          const wrap = root.querySelector<HTMLElement>('.process-track-wrap');
          if (!track || !wrap) return;
          const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 60);
          gsap.to(track, {
            x: () => -distance(), ease: 'none',
            scrollTrigger: {
              trigger: wrap, start: 'top top', end: () => `+=${distance() + window.innerHeight * .65}`,
              pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
            },
          });
        });
      }, root);

      const coarse = window.matchMedia('(pointer: coarse)').matches;
      if (!coarse) {
        const orb = root.querySelector<HTMLElement>('.pointer-orb');
        if (orb) {
          const moveOrb = (event: PointerEvent) => gsap.to(orb, { x: event.clientX, y: event.clientY, duration: .75, ease: 'power3.out', overwrite: true });
          window.addEventListener('pointermove', moveOrb, { passive: true });
          listeners.push(() => window.removeEventListener('pointermove', moveOrb));
        }
        root.querySelectorAll<HTMLElement>('.magnetic, .service-cta, .package-btn').forEach(button => {
          const move = (event: PointerEvent) => {
            const rect = button.getBoundingClientRect();
            gsap.to(button, { x: (event.clientX - rect.left - rect.width / 2) * .14, y: (event.clientY - rect.top - rect.height / 2) * .18, duration: .25, ease: 'power2.out' });
          };
          const leave = () => gsap.to(button, { x: 0, y: 0, duration: .55, ease: 'elastic.out(1, .45)' });
          button.addEventListener('pointermove', move);
          button.addEventListener('pointerleave', leave);
          listeners.push(() => { button.removeEventListener('pointermove', move); button.removeEventListener('pointerleave', leave); });
        });

        root.querySelectorAll<HTMLElement>('.bento-card, .package-card, .process-panel').forEach(card => {
          const enter = () => gsap.to(card, { y: -8, duration: .28, ease: 'power2.out' });
          const leave = () => gsap.to(card, { y: 0, duration: .45, ease: 'power3.out' });
          card.addEventListener('pointerenter', enter); card.addEventListener('pointerleave', leave);
          listeners.push(() => { card.removeEventListener('pointerenter', enter); card.removeEventListener('pointerleave', leave); });
        });
      }

      requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    return {
      destroy: () => this.zone.runOutsideAngular(() => {
        listeners.forEach(remove => remove());
        media?.revert();
        context?.revert();
        ScrollTrigger.getAll().forEach(trigger => {
          if (root.contains(trigger.trigger as Node)) trigger.kill();
        });
      }),
    };
  }

  animateServiceSwap(root: HTMLElement): void {
    if (!this.registered || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.zone.runOutsideAngular(() => requestAnimationFrame(() => {
      const targets = root.querySelectorAll('.service-feature__copy > *, .service-feature__media');
      gsap.fromTo(targets, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .55, stagger: .045, ease: 'power3.out', overwrite: true });
    }));
  }

  animatePrices(root: HTMLElement): void {
    if (!this.registered || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.zone.runOutsideAngular(() => requestAnimationFrame(() => {
      gsap.fromTo(root.querySelectorAll('.package-price strong'), { y: 12, opacity: .35 }, { y: 0, opacity: 1, duration: .45, stagger: .06, ease: 'power3.out' });
    }));
  }

  private register(): void {
    if (this.registered) return;
    gsap.registerPlugin(ScrollTrigger);
    this.registered = true;
  }
}
