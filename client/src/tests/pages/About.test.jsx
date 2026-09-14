/**
 * @jest-environment jsdom
 */

const React = require('react');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;
const { MemoryRouter } = require('react-router-dom');

const About = require('../../pages/public/About').default;
const { aboutPage } = require('../../data/demoContent');

describe('About page', () => {
  it('renders story, how-it-works, visit, and CTAs', async () => {
    let tree;
    await act(async () => {
      tree = TestRenderer.create(
        React.createElement(MemoryRouter, null, React.createElement(About))
      );
    });

    const body = JSON.stringify(tree.toJSON());
    expect(body).toContain(aboutPage.intro.headline);
    expect(body).toContain(aboutPage.story.title);
    expect(body).toContain(aboutPage.howItWorks.title);
    expect(body).toContain(aboutPage.craft.title);
    expect(body).toContain(aboutPage.team.title);
    expect(body).toContain(aboutPage.visit.title);
    expect(body).toContain(aboutPage.visit.address);
    expect(body).toContain(aboutPage.cta.menuLabel);
    expect(body).toContain(aboutPage.cta.registerLabel);
  });
});
