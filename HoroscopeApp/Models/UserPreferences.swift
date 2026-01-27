import Foundation
import FirebaseFirestore

/// User preferences stored in Firestore
struct UserPreferences: Codable, Equatable {
    var preferredSign: ZodiacSign
    var preferredStyle: HoroscopeStyle
    var preferredSlotMode: SlotMode
    var updatedAt: Date?
    
    init(
        preferredSign: ZodiacSign = .aries,
        preferredStyle: HoroscopeStyle = .plain,
        preferredSlotMode: SlotMode = .daily,
        updatedAt: Date? = nil
    ) {
        self.preferredSign = preferredSign
        self.preferredStyle = preferredStyle
        self.preferredSlotMode = preferredSlotMode
        self.updatedAt = updatedAt
    }
}

// MARK: - Firestore Conversion

extension UserPreferences {
    /// Keys for Firestore document fields
    enum FieldKeys {
        static let preferredSign = "preferredSign"
        static let preferredStyle = "preferredStyle"
        static let preferredSlotMode = "preferredSlotMode"
        static let updatedAt = "updatedAt"
    }
    
    /// Initialize from Firestore document
    init?(document: DocumentSnapshot) {
        guard let data = document.data() else { return nil }
        
        let signString = data[FieldKeys.preferredSign] as? String ?? ZodiacSign.aries.rawValue
        let styleString = data[FieldKeys.preferredStyle] as? String ?? HoroscopeStyle.plain.rawValue
        let slotModeString = data[FieldKeys.preferredSlotMode] as? String ?? SlotMode.daily.rawValue
        
        self.preferredSign = ZodiacSign(rawValue: signString) ?? .aries
        self.preferredStyle = HoroscopeStyle(rawValue: styleString) ?? .plain
        self.preferredSlotMode = SlotMode(rawValue: slotModeString) ?? .daily
        self.updatedAt = (data[FieldKeys.updatedAt] as? Timestamp)?.dateValue()
    }
    
    /// Convert to Firestore data dictionary
    func toFirestoreData() -> [String: Any] {
        return [
            FieldKeys.preferredSign: preferredSign.rawValue,
            FieldKeys.preferredStyle: preferredStyle.rawValue,
            FieldKeys.preferredSlotMode: preferredSlotMode.rawValue,
            FieldKeys.updatedAt: FieldValue.serverTimestamp()
        ]
    }
}
