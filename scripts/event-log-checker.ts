import assert from 'assert';
import fetch from 'node-fetch';
import { allTemplates } from '../code/lib/cli/src/repro-templates';

const PORT = process.env.PORT || 6007;

const eventTypeExpectations = {
  build: {},
};

async function run() {
  const [eventType, templateName] = process.argv.slice(2);

  if (!eventType || !templateName) {
    throw new Error(
      `Need eventType and templateName; call with ./event-log-checker <eventType> <templateName>`
    );
  }

  const expectation = eventTypeExpectations[eventType as keyof typeof eventTypeExpectations];
  if (!expectation) throw new Error(`Unexpected eventType '${eventType}'`);

  const template = allTemplates[templateName as keyof typeof allTemplates];
  if (!template) throw new Error(`Unexpected template '${templateName}'`);

  const events = await (await fetch(`http://localhost:${PORT}/event-log`)).json();

  assert.equal(events.length, 2);

  const [bootEvent, mainEvent] = events;

  assert.equal(bootEvent.eventType, 'boot');
  assert.equal(bootEvent.payload?.eventType, eventType);

  const { exampleStoryCount, exampleDocsCount } = mainEvent.payload?.storyIndex || {};
  if (['build', 'dev'].includes(eventType)) {
    assert.equal(exampleStoryCount, 8);
    assert.equal(exampleDocsCount, 3);
  }

  assert.equal(mainEvent.eventType, eventType);
  assert.notEqual(mainEvent.eventId, bootEvent.eventId);
  assert.equal(mainEvent.sessionId, bootEvent.sessionId);

  const {
    expected: { renderer, builder, framework },
  } = template;

  assert.equal(mainEvent.metadata.renderer, renderer);
  assert.equal(mainEvent.metadata.builder, builder);
  assert.equal(mainEvent.metadata.framework.name, framework);
}

export {};

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
}
