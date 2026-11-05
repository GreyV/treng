import { Field, Panel, Segmented } from "@/components/account/ui";
import { LEVELS, updateProfile, useAppState } from "@/lib/store";

const AVATARS = ["🙂", "😎", "🤓", "🦊", "🐼", "🐸", "🦉", "🚀", "🌟", "🎧"];

const ProfileTab = () => {
  const { profile } = useAppState();

  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 text-4xl dark:bg-cyan-900/50">
            {profile.avatar}
          </span>
          <div>
            <p className="text-xl font-semibold">{profile.name || "Learner"}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Level {profile.level} · {profile.dailyGoal} cards a day
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="Profile">
        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          <Field label="Name">
            <input
              type="text"
              value={profile.name}
              maxLength={30}
              placeholder="Learner"
              onChange={(e) => updateProfile({ name: e.target.value })}
              className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-1.5 dark:border-slate-600 dark:bg-slate-900"
            />
          </Field>

          <Field label="Avatar">
            <Segmented
              label="Avatar"
              value={profile.avatar}
              onChange={(avatar) => updateProfile({ avatar })}
              options={AVATARS.map((a) => ({ value: a, label: a }))}
            />
          </Field>

          <Field label="English level" hint="A1 is a beginner, C2 is close to native.">
            <Segmented
              label="English level"
              value={profile.level}
              onChange={(level) => updateProfile({ level })}
              options={LEVELS.map((l) => ({ value: l, label: l }))}
            />
          </Field>

          <Field label="Daily goal" hint="Cards to review per day.">
            <Segmented
              label="Daily goal"
              value={profile.dailyGoal}
              onChange={(dailyGoal) => updateProfile({ dailyGoal })}
              options={[5, 10, 20, 30].map((n) => ({ value: n, label: String(n) }))}
            />
          </Field>
        </div>
      </Panel>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">Changes are saved automatically.</p>
    </div>
  );
};

export default ProfileTab;
