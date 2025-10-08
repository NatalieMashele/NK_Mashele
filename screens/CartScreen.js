import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  SafeAreaView,
} from "react-native";
import { getDatabase, ref, onValue, remove, update } from "firebase/database";
import { auth } from "../firebase";

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const db = getDatabase();
    const user = auth.currentUser;
    if (!user) return;

    const cartRef = ref(db, `carts/${user.uid}`);
    const unsubscribe = onValue(cartRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.values(data);
        setCartItems(items);
        const totalPrice = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        setTotal(totalPrice);
      } else {
        setCartItems([]);
        setTotal(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleQuantityChange = (item, change) => {
    const db = getDatabase();
    const user = auth.currentUser;
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      remove(ref(db, `carts/${user.uid}/${item.id}`));
    } else {
      update(ref(db, `carts/${user.uid}/${item.id}`), {
        quantity: newQuantity,
      });
    }
  };

  const handleRemoveItem = (item) => {
    Alert.alert("Remove Item", `Remove ${item.title}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const db = getDatabase();
          const user = auth.currentUser;
          remove(ref(db, `carts/${user.uid}/${item.id}`));
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.price}>R{item.price.toFixed(2)}</Text>

        <View style={styles.quantityRow}>
          <TouchableOpacity 
            style={styles.qtyButton} 
            onPress={() => handleQuantityChange(item, -1)}
          >
            <Text style={styles.qtyText}>−</Text>
          </TouchableOpacity>

          <Text style={styles.qtyNumber}>{item.quantity}</Text>

          <TouchableOpacity 
            style={styles.qtyButton} 
            onPress={() => handleQuantityChange(item, +1)}
          >
            <Text style={styles.qtyText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => handleRemoveItem(item)}>
        <Text style={styles.removeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Your Cart</Text>

        <View style={{ width: 30 }} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />

          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: </Text>
            <Text style={styles.totalPrice}>R{total.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => Alert.alert("Checkout", "Proceeding to checkout...")}
          >
            <Text style={styles.checkoutText}>Checkout</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  backArrow: {
    color: "white",
    fontSize: 22,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 6,
  },
  price: {
    fontSize: 14,
    color: "#2563eb",
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qtyText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  qtyNumber: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  removeText: {
    color: "#dc2626",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  totalText: {
    fontSize: 18,
    color: "#1e293b",
    fontWeight: "600",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563eb",
  },
  checkoutButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    margin: 16,
  },
  checkoutText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 18,
  },
});

export default CartScreen;
