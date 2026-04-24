import { useEffect } from 'react';
import { JiraConfigForm } from '../components/forms/JiraConfigForm';
import { LLMConfigForm } from '../components/forms/LLMConfigForm';
import { TemplateUpload } from '../components/forms/TemplateUpload';
import { useJira } from '../hooks/useJira';
import { useLLM } from '../hooks/useLLM';
import { useTemplates } from '../hooks/useTemplates';

export function Settings() {
  const { config: jiraConfig, loadConfig: loadJiraConfig, saveConfig: saveJiraConfig } = useJira();
  const { config: llmConfig, ollamaModels, loadConfig: loadLLMConfig, saveConfig: saveLLMConfig, testGroqConnection, testOllamaConnection, loadOllamaModels } = useLLM();
  const { templates, activeTemplate, loadTemplates, uploadTemplate, selectTemplate } = useTemplates();

  useEffect(() => {
    loadJiraConfig();
    loadLLMConfig();
    loadTemplates();
  }, [loadJiraConfig, loadLLMConfig, loadTemplates]);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500">Configure your JIRA, LLM, and template settings</p>
      </div>

      <div className="space-y-6">
        <JiraConfigForm
          config={jiraConfig}
          onSave={saveJiraConfig}
        />

        <LLMConfigForm
          config={llmConfig}
          ollamaModels={ollamaModels}
          onSave={saveLLMConfig}
          onTestGroq={testGroqConnection}
          onTestOllama={testOllamaConnection}
          onLoadOllamaModels={loadOllamaModels}
        />

        <TemplateUpload
          templates={templates}
          activeTemplate={activeTemplate}
          onUpload={uploadTemplate}
          onSelect={selectTemplate}
        />
      </div>
    </div>
  );
}
