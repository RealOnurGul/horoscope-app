import Foundation
import FirebaseFirestore

/// A single horoscope message
struct Horoscope: Codable, Identifiable, Equatable {
    let id: String
    let date: String
    let sign: ZodiacSign
    let style: HoroscopeStyle
    let slot: HoroscopeSlot
    let message: String
    let title: String?
    let createdAt: Date?
    let version: Int
    let isActive: Bool
    
    /// Creates a document ID for Firestore
    /// Format: yyyy-MM-dd__SIGN__STYLE__SLOT
    static func documentId(date: String, sign: ZodiacSign, style: HoroscopeStyle, slot: HoroscopeSlot) -> String {
        return "\(date)__\(sign.rawValue)__\(style.rawValue)__\(slot.rawValue)"
    }
    
    /// Creates an ID from components
    var documentId: String {
        Horoscope.documentId(date: date, sign: sign, style: style, slot: slot)
    }
}

// MARK: - Firestore Conversion

extension Horoscope {
    /// Keys for Firestore document fields
    enum FieldKeys {
        static let date = "date"
        static let sign = "sign"
        static let style = "style"
        static let slot = "slot"
        static let message = "message"
        static let title = "title"
        static let createdAt = "createdAt"
        static let version = "version"
        static let isActive = "isActive"
    }
    
    /// Initialize from Firestore document
    init?(document: DocumentSnapshot) {
        guard let data = document.data() else { return nil }
        
        guard
            let dateString = data[FieldKeys.date] as? String,
            let signString = data[FieldKeys.sign] as? String,
            let sign = ZodiacSign(rawValue: signString),
            let styleString = data[FieldKeys.style] as? String,
            let style = HoroscopeStyle(rawValue: styleString),
            let slotString = data[FieldKeys.slot] as? String,
            let slot = HoroscopeSlot(rawValue: slotString),
            let message = data[FieldKeys.message] as? String
        else {
            return nil
        }
        
        self.id = document.documentID
        self.date = dateString
        self.sign = sign
        self.style = style
        self.slot = slot
        self.message = message
        self.title = data[FieldKeys.title] as? String
        self.createdAt = (data[FieldKeys.createdAt] as? Timestamp)?.dateValue()
        self.version = data[FieldKeys.version] as? Int ?? 1
        self.isActive = data[FieldKeys.isActive] as? Bool ?? true
    }
    
    /// Convert to Firestore data dictionary
    func toFirestoreData() -> [String: Any] {
        var data: [String: Any] = [
            FieldKeys.date: date,
            FieldKeys.sign: sign.rawValue,
            FieldKeys.style: style.rawValue,
            FieldKeys.slot: slot.rawValue,
            FieldKeys.message: message,
            FieldKeys.version: version,
            FieldKeys.isActive: isActive,
            FieldKeys.createdAt: FieldValue.serverTimestamp()
        ]
        
        if let title = title {
            data[FieldKeys.title] = title
        }
        
        return data
    }
}

// MARK: - Cached Horoscope

/// Simplified version stored in local cache for widget access
struct CachedHoroscope: Codable, Equatable {
    let sign: ZodiacSign
    let style: HoroscopeStyle
    let message: String
    let date: String
    let updatedAt: Date
    
    init(from horoscope: Horoscope) {
        self.sign = horoscope.sign
        self.style = horoscope.style
        self.message = horoscope.message
        self.date = horoscope.date
        self.updatedAt = Date()
    }
    
    init(sign: ZodiacSign, style: HoroscopeStyle, message: String, date: String, updatedAt: Date = Date()) {
        self.sign = sign
        self.style = style
        self.message = message
        self.date = date
        self.updatedAt = updatedAt
    }
}
