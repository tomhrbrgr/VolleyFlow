import React from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { Court } from '../components/Court';
import { useRotationStore } from '../store/rotationStore';

const RoleBadge: React.FC<{ role: string; active: boolean; onPress: () => void }> = ({ role, active, onPress }) => (
  <Pressable
    onPress={onPress}
    style={{
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: active ? '#ef4444' : '#111827',
      marginRight: 6,
    }}
  >
    <Text style={{ color: active ? '#ffffff' : '#e5e7eb', fontSize: 12, fontWeight: '700' }}>{role}</Text>
  </Pressable>
);

export const RotationScreen: React.FC = () => {
  const { players, setPlayerName, setPlayerRole, setPlayerJersey } = useRotationStore();
  const [editing, setEditing] = React.useState(false);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, backgroundColor: '#000000' }}>
        <Text style={{ color: '#e5e7eb', fontSize: 22, fontWeight: '800' }}>
          Volleyball Rotations
        </Text>
        <Text style={{ color: '#9ca3af', marginTop: 4 }}>
          Drag players; Rotate to shift the full 9‑person ring; toggle 6–2 / 5–1
        </Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <Pressable onPress={() => setEditing((e) => !e)} style={{ backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>{editing ? 'Close Roster' : 'Edit Roster'}</Text>
          </Pressable>
        </View>
      </View>

      {editing ? (
        <ScrollView style={{ backgroundColor: '#000', paddingHorizontal: 16, paddingTop: 12 }} contentContainerStyle={{ paddingBottom: 12 }}>
          {players.map((p) => (
            <View key={p.id} style={{ backgroundColor: '#111827', borderRadius: 12, padding: 12, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  value={p.name}
                  onChangeText={(t) => setPlayerName(p.id, t)}
                  placeholder="Name"
                  placeholderTextColor="#9ca3af"
                  style={{ flex: 1, color: '#e5e7eb', backgroundColor: '#000', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }}
                />
                <TextInput
                  value={p.jersey ? String(p.jersey) : ''}
                  onChangeText={(t) => setPlayerJersey(p.id, t ? parseInt(t, 10) : undefined)}
                  keyboardType="number-pad"
                  placeholder="#"
                  placeholderTextColor="#9ca3af"
                  style={{ width: 60, marginLeft: 8, color: '#e5e7eb', backgroundColor: '#000', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, textAlign: 'center' }}
                />
              </View>
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                {(['S','OH','OPP','MB','L','DS'] as const).map((r) => (
                  <RoleBadge key={r} role={r} active={p.role === r} onPress={() => setPlayerRole(p.id, r)} />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Court />
      )}
    </View>
  );
};