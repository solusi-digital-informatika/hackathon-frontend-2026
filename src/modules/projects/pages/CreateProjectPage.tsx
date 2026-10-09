import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../api/projects-api';
import { ApiClientError } from '../../../core/network/api-client';
import { TextField } from '../../../core/ui/Form/TextField';
import { TextArea } from '../../../core/ui/Form/TextArea';
import { Button } from '../../../core/ui/Button/Button';
import { ErrorBanner } from '../../../core/ui/Banner/ErrorBanner';
import { LoadingIndicator } from '../../../core/ui/Loading/LoadingIndicator';

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; description?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const validate = (): boolean => {
    const errors: { name?: string; description?: string } = {};
    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    if (!trimmedName) {
      errors.name = 'Project Name is required and cannot be empty or whitespace only.';
    } else if (trimmedName.length > 100) {
      errors.name = 'Project Name must be 100 characters or fewer.';
    }

    if (trimmedDesc.length > 500) {
      errors.description = 'Description must be 500 characters or fewer.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() ? description.trim() : undefined,
      };

      const created = await projectsApi.createProject(payload);
      navigate(`/projects/${created.id}`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 400 && err.fields.length > 0) {
          const apiFieldErrors: { name?: string; description?: string } = {};
          err.fields.forEach((f) => {
            if (f.field === 'name') apiFieldErrors.name = f.message;
            if (f.field === 'description') apiFieldErrors.description = f.message;
          });
          setFieldErrors((prev) => ({ ...prev, ...apiFieldErrors }));
          if (Object.keys(apiFieldErrors).length === 0) {
            setServerError(err.message);
          }
        } else {
          setServerError(err.message || 'An error occurred while creating the project.');
        }
      } else {
        setServerError('An unexpected error occurred while creating the project.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  return (
    <div className="create-project-page">
      <div className="create-project-card">
        <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>
          Create Project
        </h1>

        {serverError && (
          <ErrorBanner
            title="Unable to create project"
            message={serverError}
            onRetry={() => {}}
          />
        )}

        {submitting && <LoadingIndicator message="Creating project..." />}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Project Name"
            id="project-name"
            required
            value={name}
            disabled={submitting}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) {
                setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            error={fieldErrors.name}
            placeholder="e.g. Demo film"
            helperText="1–100 characters. Unique or duplicate names allowed."
          />

          <TextArea
            label="Description"
            id="project-description"
            value={description}
            disabled={submitting}
            onChange={(e) => {
              setDescription(e.target.value);
              if (fieldErrors.description) {
                setFieldErrors((prev) => ({ ...prev, description: undefined }));
              }
            }}
            error={fieldErrors.description}
            placeholder="Optional project summary (up to 500 characters)"
            helperText="Optional, max 500 characters."
          />

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
            >
              Create &amp; Open Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
