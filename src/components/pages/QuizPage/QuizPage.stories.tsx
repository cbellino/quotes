import React from "react";
import { storiesOf } from "@storybook/react";
import { withKnobs, object } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";

import { QuizPageView } from "components";
import { quotes as quotesData, persons as personsData } from "data";

const stories = storiesOf("Pages/Quiz", module);
stories.addDecorator(withKnobs);

stories.add("with knobs", () => {
  const key = "hi";
  const quote = object("Quote", quotesData[0]);
  const persons = object("Persons", personsData);
  const onAnswer = action("onAnswer");

  return (
    <QuizPageView
      key={key}
      quote={quote}
      persons={persons}
      onAnswer={onAnswer}
    />
  );
});
