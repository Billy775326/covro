import { GlobalDefaultsDialog } from './GlobalDefaultsDialog';
import { GlobalInstructionsEditor } from './GlobalInstructionsEditor';
import { useTheme, setTheme, type Theme } from '../lib/theme';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Bell,
  Gauge,
  ChevronRight,
  DatabaseBackup,
  Languages,
  Moon,
  Server,
  Settings,
  SlidersHorizontal,
  FileText,
} from 'lucide-react';
import { changeLocale, currentLocale, t } from '../i18n';
import { localeNames, supportedLocales, type Locale } from '../i18n/locales';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { SystemInfo } from '../../shared/types';
import { AccountUsage } from './AccountUsage';
import { Icon } from './Icon';

interface Props {
  system?: SystemInfo;
  offline?: boolean;
  notificationStatus: string;
  onNotificationSettings: () => void;
  onGatewaySettings: () => void;
  onBackups?: () => void;
}

export function SidebarSettings(props: Props) {
  const [open, setOpen] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [defaultsOpen, setDefaultsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  return (
    <>
      <Button
        className="sidebar-settings-trigger"
        variant="ghost"
        size="sm"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Settings size={16} aria-hidden="true" />
        {t('sidebar:settings')}
      </Button>
      {open && (
        <SettingsDialog
          {...props}
          onInstructions={() => setInstructionsOpen(true)}
          onDefaults={() => setDefaultsOpen(true)}
          onAccountUsage={() => setAccountOpen(true)}
          onClose={() => setOpen(false)}
        />
      )}
      {instructionsOpen && (
        <GlobalInstructionsEditor
          disabled={props.offline ?? false}
          onClose={() => setInstructionsOpen(false)}
        />
      )}
      {defaultsOpen && (
        <GlobalDefaultsDialog
          disabled={props.offline ?? false}
          onClose={() => setDefaultsOpen(false)}
        />
      )}
      {accountOpen && (
        <AccountUsage
          system={props.system}
          offline={props.offline ?? false}
          onClose={() => setAccountOpen(false)}
        />
      )}
    </>
  );
}

function SettingsDialog({
  onClose,
  onAccountUsage,
  onDefaults,
  onInstructions,
  ...props
}: Props & {
  onClose: () => void;
  onAccountUsage: () => void;
  onInstructions: () => void;
  onDefaults: () => void;
}) {
  const theme = useTheme();
  const dialog = useRef<HTMLDialogElement>(null);
  const { onBackups } = props;
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  const close = () => {
    // Close while still mounted so the browser can restore focus to the footer trigger.
    dialog.current?.close();
    onClose();
  };
  const navigate = (action: () => void) => {
    close();
    action();
  };
  return (
    <dialog
      ref={dialog}
      className="project-dialog sidebar-settings-dialog"
      aria-labelledby="sidebar-settings-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <div className="project-dialog-heading">
        <div>
          <Settings size={20} aria-hidden="true" />
          <h2 id="sidebar-settings-title">{t('sidebar:settings')}</h2>
        </div>
        <Button variant="ghost" size="icon" aria-label={t('common:close')} onClick={close}>
          <Icon name="close" size={17} />
        </Button>
      </div>
      <div className="settings-sections">
        <SettingsSection
          controls
          id="settings-interface"
          title={t('sidebar:settings_group_interface')}
        >
          <label className="language-selector">
            <Languages size={18} aria-hidden="true" />
            <span>{t('common:language')}</span>
            <Select
              value={currentLocale()}
              onValueChange={(value) => void changeLocale(value as Locale)}
            >
              <SelectTrigger aria-label={t('common:language')} data-value={currentLocale()}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedLocales.map((locale) => (
                  <SelectItem key={locale} value={locale} lang={locale}>
                    {localeNames[locale]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="appearance-selector">
            <Moon size={18} aria-hidden="true" />
            <span>{t('common:appearance')}</span>
            <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
              <SelectTrigger aria-label={t('common:appearance')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">{t('common:theme_system')}</SelectItem>
                <SelectItem value="light">{t('common:theme_light')}</SelectItem>
                <SelectItem value="dark">{t('common:theme_dark')}</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </SettingsSection>
        <SettingsSection id="settings-agent" title={t('sidebar:settings_group_agent')}>
          <Button variant="ghost" onClick={() => navigate(onDefaults)}>
            <SlidersHorizontal size={18} aria-hidden="true" />
            <span className="sidebar-settings-label">{t('settings:global_defaults_title')}</span>
            <ChevronRight size={16} aria-hidden="true" />
          </Button>
          <Button variant="ghost" onClick={() => navigate(onInstructions)}>
            <FileText size={18} aria-hidden="true" />
            <span className="sidebar-settings-label">{t('sidebar:instructions_edit')}</span>
            <ChevronRight size={16} aria-hidden="true" />
          </Button>
        </SettingsSection>
        <SettingsSection id="settings-account" title={t('sidebar:settings_group_account')}>
          <Button variant="ghost" onClick={() => navigate(onAccountUsage)}>
            <Gauge size={18} aria-hidden="true" />
            <span className="sidebar-settings-label">{t('account:title')}</span>
            <ChevronRight size={16} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            aria-label={t('sidebar:browser_notifications_status', { v0: props.notificationStatus })}
            onClick={() => navigate(props.onNotificationSettings)}
          >
            <Bell size={18} aria-hidden="true" />
            <span className="sidebar-settings-label">{t('sidebar:browser_notifications')}</span>
            <span className="sidebar-settings-status">{props.notificationStatus}</span>
            <ChevronRight size={16} aria-hidden="true" />
          </Button>
        </SettingsSection>
        <SettingsSection id="settings-service" title={t('sidebar:settings_group_service')}>
          <Button variant="ghost" onClick={() => navigate(props.onGatewaySettings)}>
            <Server size={18} aria-hidden="true" />
            <span className="sidebar-settings-label">{t('common:service_settings')}</span>
            <ChevronRight size={16} aria-hidden="true" />
          </Button>
          {onBackups && (
            <Button variant="ghost" onClick={() => navigate(onBackups)}>
              <DatabaseBackup size={18} aria-hidden="true" />
              <span className="sidebar-settings-label">{t('backups:title')}</span>
              <ChevronRight size={16} aria-hidden="true" />
            </Button>
          )}
        </SettingsSection>
      </div>
      <div className="sidebar-settings-execution">
        <Server size={17} aria-hidden="true" />
        <div>
          <strong>{t('sidebar:runs_on_server')}</strong>
          <p>{t('sidebar:code_and_credentials_stay_on_the_computer_running')}</p>
        </div>
      </div>
    </dialog>
  );
}

function SettingsSection({
  id,
  title,
  children,
  controls = false,
}: {
  controls?: boolean;
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="settings-section" aria-labelledby={id}>
      <h3 id={id} className="settings-section-title">
        {title}
      </h3>
      <div className={`settings-section-body${controls ? '' : ' sidebar-settings-links'}`}>
        {children}
      </div>
    </section>
  );
}
