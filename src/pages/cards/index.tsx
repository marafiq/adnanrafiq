import React from 'react';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import {Cards} from './_cards';

export default function CodeCards(): React.JSX.Element {
  return <Layout title="Adnan Rafiq - A Developer Blog - cards" description="Adnan is a blogger, developer, freelancer, and caretaker. A code cards page. ">
    <main className="container code-cards">
      <p className="eyebrow">Keep it handy</p>
      <h1>👋🏽 Code Cards</h1>
      <div className="code-cards-grid">
        {Cards.map(({description, fileName, language, title}) =>
          <section key={fileName} aria-label={title}>
            <h2>{title}</h2>
            <p>{description}</p>
            <CodeBlock className={language} title={title}>
              {require(`!!raw-loader!./${fileName}`).default}
            </CodeBlock>
          </section>
        )}
      </div>
    </main>
  </Layout>;
}
